// index.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDb from './config/connectdb.js';
import redisClient from './config/redis.js';
import startPriceMonitoring from './utils/pricefetcher.js';
import { checkAlerts } from './controllers/alertcontroller.js';
import { updatePricesInCache } from './service/priceService.js';
import cron from 'node-cron';
dotenv.config();

const app = express();

connectDb();
redisClient.connect();
cron.schedule('* * * * *', async () => {
    console.log('Cron job started');
    await updatePricesInCache();
    await checkAlerts();
  });


import userRouter from './routes/userRoutes.js';
import alertRouter from './routes/alterroute.js';

const port = process.env.PORT;

app.use(cors());
app.use(express.json());

// Load Routes
app.use("/api/user/", userRouter);
app.use("/api/alert/", alertRouter);

app.listen(port, () => {
    console.log(`Server listening at localhost:${port}`);
    startPriceMonitoring();
});
