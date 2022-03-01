import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  brand: 'ThePureM',
  title: 'ThePureM Account',
  home: 'https://www.thepurem.com',
}));
