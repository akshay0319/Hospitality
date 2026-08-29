# 🚀 Deploy HospitalityOS AI on AWS (Docker)

The whole stack — **frontend + backend + database** — runs from one file with Docker Compose. No XAMPP, no manual DB import: the database container loads the full schema + demo data automatically on first boot.

---

## What's in the box

| Service | Image / build | Port |
|---|---|---|
| `frontend` | Next.js (standalone build) | 3000 |
| `backend` | NestJS + Prisma | 4000 |
| `db` | MariaDB 11 (auto-seeded from `docker/mysql-init/`) | 3306 (internal) |

---

## A. Run it locally first (sanity check)

Needs **Docker Desktop** (or Docker Engine + Compose).

```bash
cp .env.docker.example .env      # then edit .env if you want
docker compose up -d --build
```

Open **http://localhost:3000** → login `manager@grandmeridian.in` / `demo1234`.

Stop / reset:
```bash
docker compose down              # stop (keeps the database volume)
docker compose down -v           # stop AND wipe the database (re-seeds fresh next up)
```

---

## B. Deploy on AWS EC2 (simplest path)

### 1. Launch an EC2 instance
- **Ubuntu 22.04**, `t3.small` or bigger (2 GB+ RAM).
- **Security group** — open inbound: `22` (SSH), `3000` (app), `4000` (API). *(Later: put it behind a domain + HTTPS and close 4000 publicly — see hardening.)*

### 2. Install Docker
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER && newgrp docker
```

### 3. Get the code
```bash
git clone https://github.com/akshay0319/Hospitality.git
cd Hospitality
```

### 4. Configure `.env` — **the one important step**
```bash
cp .env.docker.example .env
nano .env
```
Set these to your instance's **public IP** (or domain), and change the secrets:
```env
DB_PASSWORD=<a-strong-password>
JWT_SECRET=<random-long-string>
JWT_REFRESH_SECRET=<another-random-string>
NEXT_PUBLIC_API_URL=http://<EC2_PUBLIC_IP>:4000/api/v1
FRONTEND_URL=http://<EC2_PUBLIC_IP>:3000
# optional:
OPENAI_API_KEY=sk-...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```
> ⚠️ **`NEXT_PUBLIC_API_URL` is baked into the frontend at build time** and is called by the visitor's browser — so it must be the **public** backend address, not `localhost` or `backend`. Get this wrong and the UI loads but every API call fails.

### 5. Launch
```bash
docker compose up -d --build
```
Open **http://<EC2_PUBLIC_IP>:3000**. Done. 🎉

Logs / status:
```bash
docker compose ps
docker compose logs -f backend
```

---

## C. Production hardening (when you go past a demo)

- **Put a reverse proxy in front** (Nginx or an AWS ALB) terminating **HTTPS**, route `/` → frontend:3000 and `/api` → backend:4000. Then set `NEXT_PUBLIC_API_URL=https://yourdomain/api/v1` and stop exposing port 4000 publicly.
- **Managed database:** swap the `db` service for **Amazon RDS (MySQL/MariaDB)** — point `DATABASE_URL` at it and drop the `db` service. Import `docker/mysql-init/01-hospitality.sql` once.
- **Secrets:** use AWS SSM Parameter Store / Secrets Manager instead of a plaintext `.env`.
- **Images in ECR + ECS/Fargate** for a fully managed setup: `docker build`, `docker tag`, `docker push` each image to ECR, then run them as an ECS service. (Compose above is the fast path; ECS is the scalable one.)

---

## Updating the seeded database snapshot

`docker/mysql-init/01-hospitality.sql` is a dump of the dev DB (schema + triggers + demo data). To refresh it after schema changes:
```bash
"/c/xampp73/mysql/bin/mysqldump.exe" -u root hospitality --routines --triggers --add-drop-table \
  | sed -E 's/DEFINER=[^ ]+ //g' > docker/mysql-init/01-hospitality.sql
```
It only re-runs on a **fresh** database volume (`docker compose down -v` then `up`).
