import { registerAs } from '@nestjs/config';

const redisURL = process.env.REDIS_URL; // Heroku Redis

export default registerAs('redis', () => ({
  host: redisURL,
}));
