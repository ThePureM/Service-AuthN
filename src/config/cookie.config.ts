import { registerAs } from '@nestjs/config';

const secureKey = process.env.SECURE_KEY; // Heroku Secure Key

export default registerAs('cookie', () => ({
  secret: secureKey.split(','),
}));
