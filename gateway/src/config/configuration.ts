import {createSecretKey} from 'crypto';

export default () => ({
    port: parseInt(process.env.PORT, 10),

    jwt: {
        secret: createSecretKey(Buffer.from(process.env.JWT_SECRET_BASE64, 'base64')),
    },

    services: {
        auth: {
            url: process.env.AUTH_SERVICE_URL
        },
        events: {
            url: process.env.EVENT_SERVICE_URL
        },
    },
})