import { registerAs } from '@nestjs/config';

const secureKey = process.env.SECURE_KEY; // Heroku Secure Key

export default registerAs('session', () => ({
  secret: secureKey.split(','),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    maxAgeRemember: 7 * 24 * 60 * 60 * 1000,
  },
}));
