require('dotenv').config();
const { DataSource } = require('typeorm');
const UserEntity = require('./entities/User.entity');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'auth_db',
  synchronize: true,
  logging: false,
  entities: [UserEntity],
  migrations: [],
  subscribers: []
});

module.exports = AppDataSource;
