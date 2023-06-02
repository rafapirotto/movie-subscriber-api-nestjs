export enum Environments {
  DEV = 'development',
  PROD = 'production',
}

export interface EnvVariables {
  DATABASE_URL: string;
  ENV: Environments;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  PORT: number;
  PUSHOVER_USER_KEY: string;
  PUSHOVER_APPLICATION_KEY: string;
}
