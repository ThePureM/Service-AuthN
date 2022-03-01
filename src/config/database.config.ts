import { registerAs } from '@nestjs/config';

const postgresURL = process.env.DATABASE_URL; // Heroku Postgres

export default registerAs('database', () => ({
  url: postgresURL,
}));
