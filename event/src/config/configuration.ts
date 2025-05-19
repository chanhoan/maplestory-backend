import * as dotenv from 'dotenv';
import * as path from 'path';

const env = process.env.NODE_ENV || 'development';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${env}`),
});

export default () => {
  const {
    PORT,

    GATEWAY_SERVICE_URL,
    AUTH_SERVICE_URL,

    MONGODB_HOST,
    MONGODB_PORT,
    MONGODB_DB,
    MONGODB_USER,
    MONGODB_PASS,

    KAFKA_BROKERS,
    KAFKA_CLIENT_ID,
    KAFKA_GROUP_ID,
    KAFKA_SASL_USERNAME,
    KAFKA_SASL_PASSWORD,
  } = process.env;

  if (!MONGODB_HOST || !MONGODB_DB) {
    throw new Error('MongoDB connection info is missing in .env');
  }

  if (!KAFKA_BROKERS) throw new Error('KAFKA_BROKERS is not defined');
  if (!KAFKA_CLIENT_ID) throw new Error('KAFKA_CLIENT_ID is missing');
  if (!KAFKA_GROUP_ID) throw new Error('KAFKA_GROUP_ID is missing');

  const brokers = KAFKA_BROKERS.split(',').map((b) => b.trim());

  return {
    port: parseInt(PORT!, 10) || 4001,

    mongodb: {
      host: MONGODB_HOST,
      port: parseInt(MONGODB_PORT!, 10) || 27017,
      db: MONGODB_DB,
      user: MONGODB_USER,
      pass: MONGODB_PASS,
    },

    services: {
      gateway: {
        url: GATEWAY_SERVICE_URL,
      },
      auth: {
        url: AUTH_SERVICE_URL,
      },
    },

    kafka: {
      clientId: KAFKA_CLIENT_ID,
      brokers: brokers,
      groupId: KAFKA_GROUP_ID,
      sasl: {
        mechanism: 'scram-sha-256',
        username: KAFKA_SASL_USERNAME!,
        password: KAFKA_SASL_PASSWORD!,
      },
      ssl: false,
    },
  };
};
