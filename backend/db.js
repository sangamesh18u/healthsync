import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isCloud = process.env.DB_HOST && process.env.DB_HOST !== 'localhost';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'hospital_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    ...(isCloud && {
      dialectOptions: {
        ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true,
        },
      },
    }),
  }
);

export default sequelize;
