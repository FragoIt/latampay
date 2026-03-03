import express from 'express';
import cors from 'cors';
import { env, isDevelopment } from './config/env';

import invoicesRouter from './routes/invoices';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use('/invoices', invoicesRouter);


app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'latampay-api',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.listen(env.PORT, () => {
  console.log(`🚀 LatamPay API running on port ${env.PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  if (isDevelopment) {
    console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
  }
});

