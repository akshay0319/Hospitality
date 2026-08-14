"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, X, Loader2, Shield, Users, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui-kit";
import { usersService, type StaffUser, type UserRole, type CreateUserInput } from "@/lib/services/users.service";
import { useAuthStore } from "@/store/auth";
import { initials } from "@/lib/mappers";
import { cn } from "@/lib/utils";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "OWNER", label: "Owner" },
  { value: "GENERAL_MANAGER", label: "General Manager" },
  { value: "REVENUE_MANAGER", label: "Revenue Manager" },
  { value: "FRONT_DESK", label: "Front Desk" },
  { value: "HOUSEKEEPING_SUPERVISOR", label: "HK Supervisor" },
  { value: "HOUSEKEEPER", label: "Housekeeper" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "FINANCE", label: "Finance" },
];
const ADMIN_ROLES = ["OWNER", "GENERAL_MANAGER"];

export default function UsersRolesPage() {
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["staff", search],
    queryFn: () => usersService.findAll({ limit: 100, search: search || undefined }),
    retry: false,
  });
  const users = (data?.data as StaffUser[] | undefined) ?? [];
  const active = users.filter((u) => u.isActive).length;
  const admins = users.filter((u) => ADMIN_ROLES.includes(u.role)).length;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["staff"] });

  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => usersService.setRole(id, role),
    onSuccess: () => { toast.success("Role updated"); invalidate(); },
    onError: (e: unknown) => toast.error(errMsg(e) ?? "Failed to update role"),
  });
  const toggleActive = useMutation({
    mutationFn: (u: StaffUser) => (u.isActive ? usersService.deactivate(u.id) : usersService.reactivate(u.id)),
    onSuccess: (_d, u) => { toast.success(u.isActive ? "User deactivated" : "User reactivated"); invalidate(); },
    onError: (e: unknown) => toast.error(errMsg(e) ?? "Failed"),
  });

  return (
    <>
      <AppHeader title="Users & Roles" breadcrumb="Settings" />
      <div className="flex-1 space-y-5 p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={Users} label="Total Staff" value={users.length} tone="text-primary bg-primary-muted/60" />
          <Stat icon={CheckCircle2} label="Active" value={active} tone="text-success bg-success-muted/60" />
          <Stat icon={Shield} label="Admins" value={admins} tone="text-[color:var(--ai-hover)] bg-[color:var(--ai-muted)]/60" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
            <Search className="h-3.5 w-3.5 text-tertiary" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff by name or email…"
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-tertiary focus:outline-none" />
          </div>
          <button onClick={() => setShowInvite(true)}
            className="flex h-9 items-center gap-1.5 rounded-md gradient-primary px-3 text-[12px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110">
            <UserPlus className="h-3.5 w-3.5" /> Invite User
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="border-b border-border bg-background/40">
                <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                  <th className="px-4 py-2.5">User</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5">Department</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Last Login</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && <tr><td colSpan={6} className="px-4 py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" /></td></tr>}
                {!isLoading && users.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-muted-foreground">No staff found.</td></tr>}
                {users.map((u) => {
                  const isSelf = me?.id === u.id;
                  return (
                    <tr key={u.id} className="text-[13px]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-muted text-[11px] font-bold text-primary">
                            {initials(u.firstName, u.lastName)}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{u.firstName} {u.lastName} {isSelf && <span className="text-[10px] text-tertiary">(you)</span>}</div>
                            <div className="text-[11px] text-tertiary">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={setRole.isPending || (isSelf && ADMIN_ROLES.includes(u.role))}
                          onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value as UserRole })}
                          className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground focus:border-primary focus:outline-none disabled:opacity-60"
                        >
                          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground">{u.department ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge tone={u.isActive ? "success" : "muted"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Never"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleActive.mutate(u)}
                          disabled={toggleActive.isPending || isSelf}
                          title={isSelf ? "You can't change your own status" : ""}
                          className={cn(
                            "rounded-md border px-2.5 py-1 text-[11px] font-medium transition disabled:opacity-40",
                            u.isActive
                              ? "border-danger/40 text-danger hover:bg-danger/10"
                              : "border-success/40 text-success hover:bg-success/10",
                          )}
                        >
                          {u.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showInvite && <InviteDrawer onClose={() => setShowInvite(false)} onCreated={() => { setShowInvite(false); invalidate(); }} />}
    </>
  );
}

function errMsg(e: unknown): string | undefined {
  const m = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(m) ? m[0] : m;
}

function Stat({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-elevated p-4">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tone)}><Icon className="h-4 w-4" /></div>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-tertiary">{label}</div>
      <div className="mt-1 font-display text-[24px] font-bold tabular leading-none text-foreground">{value}</div>
    </div>
  );
}

function InviteDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateUserInput>({
    firstName: "", lastName: "", email: "", password: "", role: "FRONT_DESK", department: "", phone: "",
  });
  const [showPw, setShowPw] = useState(false);

  const create = useMutation({
    mutationFn: () => usersService.create({ ...form, department: form.department || undefined, phone: form.phone || undefined }),
    onSuccess: () => { toast.success("User invited"); onCreated(); },
    onError: (e: unknown) => toast.error(errMsg(e) ?? "Failed to create user"),
  });

  const valid = form.firstName.trim() && form.lastName.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) && form.password.length >= 8;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <aside onClick={(e) => e.stopPropagation()} className="relative h-full w-full max-w-[420px] overflow-y-auto border-l border-border bg-surface shadow-elevated animate-slide-in-right">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-5 py-3 backdrop-blur">
          <div className="text-[13px] font-semibold text-foreground">Invite Team Member</div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-elevated hover:text-foreground"><X className="h-4 w-4" /></button>
        </header>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <F label="First name"><input className="uinp" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Priya" /></F>
            <F label="Last name"><input className="uinp" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Nair" /></F>
          </div>
          <F label="Email"><input className="uinp" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="priya@yourhotel.com" /></F>
          <F label="Temporary password" hint="Min 8 chars — staff can change later">
            <div className="relative">
              <input className="uinp pr-9" type={showPw ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Role"><select className="uinp" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></F>
            <F label="Department"><input className="uinp" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Front Office" /></F>
          </div>
          <F label="Phone" hint="Optional"><input className="uinp" value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" /></F>
          <button disabled={!valid || create.isPending} onClick={() => create.mutate()}
            className="flex h-10 w-full items-center justify-center gap-1.5 rounded-md gradient-primary text-[13px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-50">
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Send invite
          </button>
        </div>
        <style>{`.uinp{width:100%;height:40px;padding:0 12px;background:var(--background);border:1px solid var(--input);border-radius:8px;color:var(--foreground);font-size:13px}.uinp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px oklch(0.62 0.18 265 / 0.15)}select.uinp{appearance:none;cursor:pointer}`}</style>
      </aside>
    </div>
  );
}

function F({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{label}</span>
        {hint && <span className="text-[10px] text-tertiary">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
