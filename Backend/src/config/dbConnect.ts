import mysql, { Pool, PoolConnection } from "mysql2/promise";
import { AppError } from "@utils/appError.js";
import env from "dotenv";

env.config();

export const dbPool: Pool = mysql.createPool({
  host: process.env.DB_HOST || "🤔",
  user: process.env.DB_USER || "🤔",
  database: process.env.DB_NAME || "🤔",
  password: process.env.DB_PASSWORD || "😁",
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // Fail fast when the server cannot be reached
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || "10000", 10),
});

export const verifyDatabaseConnection = async (): Promise<void> => {
  try {
    const connection = await dbPool.getConnection();
    await connection.query("SELECT 1");
    connection.release();
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database initialize failed");
    throw err;
  }
};

export const executeTransaction = async <T>(
  callback: (trx: PoolConnection) => Promise<T>,
): Promise<T> => {
  let connection!: PoolConnection;

  try {
    connection = await dbPool.getConnection();
  } catch (err) {
    throw new AppError(
      `Unable to acquire database connection: ${(err as Error).message || String(err)}`,
      500,
    );
  }

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};
