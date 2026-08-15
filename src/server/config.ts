import dotenv from "dotenv";

dotenv.config({});

export const env = {
  POSTGRES_DB: process.env.POSTGRES_DB as string,
  NODE_ENV: process.env.NODE_ENV as string,
  SECRET_KEY_ONE: process.env.SECRET_KEY_ONE as string,
  SECRET_KEY_TWO: process.env.SECRET_KEY_TWO as string,
  JWT_TOKEN: process.env.JWT_TOKEN as string,
  SENDER_EMAIL: process.env.SENDER_EMAIL as string,
  SENDER_EMAIL_PASSWORD: process.env.SENDER_EMAIL_PASSWORD as string,
  CLIENT_URL: process.env.CLIENT_URL as string,
  PORT: process.env.PORT,
  POSTGRES_HOST: process.env.POSTGRES_HOST as string,
  POSTGRES_PORT: process.env.POSTGRES_PORT as string,
  POSTGRES_USER: process.env.POSTGRES_USER as string,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD as string,
};
