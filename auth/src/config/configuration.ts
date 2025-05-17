import { createSecretKey } from 'crypto';
import * as process from 'process';

export default () => {
  const {
    MONGODB_HOST,
    MONGODB_PORT,
    MONGODB_DB,
    JWT_SECRET_BASE64,
    JWT_EXPIRES_IN,
    PORT,
    GATEWAY_SERVICE_URL,
    EVENT_SERVICE_URL,
    REDIS_HOST,
    REDIS_PORT,
    REFRESH_TOKEN_TTL,
  } = process.env;

  if (!MONGODB_HOST || !MONGODB_DB) {
    throw new Error('MongoDB connection info is missing in .env');
  }
  if (!JWT_SECRET_BASE64) {
    throw new Error('JWT_SECRET_BASE64 is not defined');
  }
  if (!REDIS_HOST || !REDIS_PORT) {
    throw new Error('REDIS_HOST environment is missing');
  }

  const ttlString = REFRESH_TOKEN_TTL ?? '604800';
  const ttl = parseInt(ttlString, 10);

  return {
    port: parseInt(PORT!, 10) || 4001,

    mongodb: {
      host: MONGODB_HOST,
      port: parseInt(MONGODB_PORT!, 10) || 27017,
      db: MONGODB_DB,
    },

    jwt: {
      secretKey: createSecretKey(Buffer.from(JWT_SECRET_BASE64, 'base64')),
      expiresIn: JWT_EXPIRES_IN || '3600s',
    },

    services: {
      gateway: {
        url: GATEWAY_SERVICE_URL,
      },
      events: {
        url: EVENT_SERVICE_URL,
      },
    },

    redis: {
      host: REDIS_HOST || 'localhost',
      port: parseInt(REDIS_PORT, 10) || 6379,
      ttl: ttl || 60 * 60 * 24 * 7,
    },
  };
};
