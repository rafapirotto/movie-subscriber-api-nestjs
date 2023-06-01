export enum Environments {
  DEV = 'development',
  PROD = 'production',
}

export interface EnvVariables {
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  ENV: Environments;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  PORT: number;
  PUSHOVER_USER_KEY: string;
  PUSHOVER_APPLICATION_KEY: string;
}
