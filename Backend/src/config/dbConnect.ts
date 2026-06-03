import mysql, { Pool } from "mysql2/promise";
import env from "dotenv";

env.config();

let pool: Pool | null = null;

export const connectDB = async (): Promise<Pool> => {
  if (!pool) {
    const p = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'Libro',
      password: process.env.DB_PASSWORD || '😁',
      waitForConnections: true,
      connectionLimit: 50,
      queueLimit: 10,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });

    try {
      const conn = await p.getConnection();
      await conn.query('SELECT 1');
      conn.release();
      pool = p;
      console.log("Database connection is established");
    } catch (err) {
      // close pool if connection test failed
      try {
        await p.end();
      } catch (e) {
        // ignore
      }
      throw err;
    }
  }
  return pool;
};
