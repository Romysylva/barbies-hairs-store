declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES_IN: string;
    JWT_COOKIE_EXPIRES_IN?: string;
    JWT_REFRESH_COOKIE_EXPIRES_IN?: string;
  }
}
