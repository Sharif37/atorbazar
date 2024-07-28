import { PoolOptions } from "mysql2";

const AdminCreds: PoolOptions = {
  host: process.env.DB_HOST,
  user: process.env.ADMIN_DB_USERNAME,
  password: process.env.ADMIN_DB_PASSWORD,
  database: process.env.DB_NAME,
};

export {AdminCreds};
