declare const _default: () => {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    frontendUrl: string;
    database: {
        url: string | undefined;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    aws: {
        region: string;
        accessKeyId: string | undefined;
        secretAccessKey: string | undefined;
        s3Bucket: string | undefined;
    };
    openai: {
        apiKey: string | undefined;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
};
export default _default;
