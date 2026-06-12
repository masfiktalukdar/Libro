import mysql, { Pool, PoolConnection } from "mysql2/promise";
import env from "dotenv";

env.config();

export const dbPool: Pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  database: process.env.DB_NAME || "Libro",
  password: process.env.DB_PASSWORD || "😁",
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
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
  const connection = await dbPool.getConnection();

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
