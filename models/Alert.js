import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  cryptoSymbol: {
    type: String,
    required: true,
  },
  targetPrice: {
    type: Number,
    required: true,
  },
  triggered: {
    type: Boolean,
    default: false,
  },
});

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
