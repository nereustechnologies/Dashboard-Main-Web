declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_FASTAPI_URL: string
    DATABASE_URL: string
    JWT_SECRET: string
    DB_HOST: string
    DB_NAME: string
    DB_USER: string
    DB_PASSWORD: string
  }
}

