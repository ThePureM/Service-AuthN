export default () => ({
  environment: process.env.NODE_ENV.replace(' ', '') || 'development',
  port: process.env.PORT || 3000,
  hostname: process.env.HOSTNAME || '0.0.0.0',
  proxy: process.env.APP_USE_RPROXY || false,
});
