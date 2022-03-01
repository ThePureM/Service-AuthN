import { registerAs } from '@nestjs/config';

const environment = process.env.NODE_ENV !== 'production';
const secureKey = process.env.SECURE_KEY; // Heroku Secure Key

export default registerAs('auth', () => ({
  jwt: {
    secret: secureKey.split(',')[0],
    signOptions: {
      expiresIn: '60s',
    },

    auth: {
      secret: secureKey.split(','),
    },

    refresh: {
      secret: secureKey.split(','),
      cookie: {
        httpOnly: true,
        secure: !environment,
        maxAge: 60 * 60 * 24 * 30 * 1000,
        sameSite: 'none',
      },
    },
  },
}));
