import express from 'express';
import { createAlert } from '../controllers/alertcontroller.js';

const router = express.Router();

router.post('/alert', createAlert);

export default router;
