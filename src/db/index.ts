import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.ts';

export const createPool = () => {
  const host = process.env.SQL_HOST || 'localhost';
  const isSocket = host && host.startsWith('/');
  
  const configToUse: mysql.PoolOptions = {
    user: process.env.SQL_USER || 'siyudi',
    password: process.env.SQL_PASSWORD || 'K0dokngorek!',
    database: process.env.SQL_DB_NAME || 'siyudi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  if (isSocket) {
    configToUse.socketPath = host;
  } else {
    configToUse.host = host;
  }

  return mysql.createPool(configToUse);
};

export const pool = createPool();

export const db = drizzle(pool, { schema, mode: 'default' });
export type AppDb = typeof db;

