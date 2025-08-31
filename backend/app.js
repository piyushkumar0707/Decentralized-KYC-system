import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app=express();
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import audit from './src/routes/audit.routes.js';
import user from './src/routes/user.routes.js';
import did from './src/routes/did.routes.js';
import kyc from './src/routes/kyc.routes.js';
import vc from './src/routes/vc.routes.js';

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(helmet());
app.use(morgan("combined"));
app.use(express.json({
    limit:"100kb"
}))

app.use(express.urlencoded({
    extended:true,
    limit:"100kb"
}))

const WEBHOOK_TOKEN =process.env.WEBHOOK_TOKEN;

const SECRET = process.env.SECRET;
const MAX_TIME_DIFFERENCE = +process.env.MAX_TIME_DIFFERENCE || 60;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Function to verify the signature
const verifySignature = (secret, payload, signature) => {
    if (!secret || !payload || !signature) return false;
    const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest, 'utf-8'), Buffer.from(signature, 'utf-8'));
};

// Middleware to verify the webhook tooken, signature and timestamp of incoming webhook requests
const verifyWebhookMiddleware = (webhookToken, secret, timeDifference) => {
    return (req, res, next) => {
        const token = req.headers['x-webhook-token'];
        const signature = req.headers['x-signature'];
        const timestamp = req.headers['x-timestamp'];
        const payload = req.body;

        // Check if webhook teken headers is missing or invalid
        if (!token || token !== webhookToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if signature or timestamp headers are missing
        if (!signature || !timestamp) {
            return res.status(401).json({ error: 'Signature or timestamp header is missing' });
        }

        // Validate timestamp
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (Math.abs(currentTimestamp - timestamp) > timeDifference) {
            return res.status(401).json({ error: 'Expired timestamp' });
        }

        // Check if the payload is valid
        if (!payload?.event || !payload?.data) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        // Verify the signature
        const payloadWithTimestamp = JSON.stringify(req.body) + timestamp;
        if (!verifySignature(secret, payloadWithTimestamp, signature)) {
            return res.status(403).json({ error: 'Invalid signature' });
        }
        next();
    };
};


// Endpoint to receive webhook payloads
app.post('/webhook', verifyWebhookMiddleware(WEBHOOK_TOKEN, SECRET, MAX_TIME_DIFFERENCE), (req, res) => {
    console.log('Received webhook payload:', req.body);
    const { event, data } = req.body;

    // Example: handling a specific event
    if (event === 'user.created') {
        console.log(`New user created: ${data.id}`);
        // Add your logic here to handle the new user creation
    }
    res.status(200).send('Webhook received successfully');
});

app.use(express.static("public"));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/audit',audit);

app.use('/api/user', user);
app.use('/api/did', did);
app.use('/api/kyc', kyc);
app.use('/api/vc', vc);

app.use(cookieParser());

export default app;