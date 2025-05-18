import * as process from 'process';

export default () => {
  const {
    MONGODB_HOST,
    MONGODB_PORT,
    MONGODB_DB,
    PORT,
    GATEWAY_SERVICE_URL,
    AUTH_SERVICE_URL,
    KAFKA_BROKERS,
    KAFKA_CLIENT_ID,
    KAFKA_GROUP_ID,
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
      brokers: brokers,
      clientId: KAFKA_CLIENT_ID,
      groupId: KAFKA_GROUP_ID,
    },
  };
};
