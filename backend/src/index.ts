import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import employeeRoutes from './routes/employees';
import analyticsRoutes from './routes/analytics';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
