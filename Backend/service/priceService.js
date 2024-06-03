import redisClient from '../config/redis.js';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const getCryptoPrice = async (symbol) => {
  const cacheKey = `price_${symbol}`;
  const cachedPrice = await redisClient.get(cacheKey);

  if (cachedPrice) {
    return JSON.parse(cachedPrice);
  }

  const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
    params: {
      ids: symbol,
      vs_currencies: 'usd',
      x_cg_demo_api_key: process.env.COINGECKO_API_KEY,
    }
  });

  const price = response.data[symbol].usd;

  // Cache the price for 60 seconds
  await redisClient.set(cacheKey, JSON.stringify(price), 'EX', 60);
  return price;
};

const updatePricesInCache = async () => {
  const symbols = ['bitcoin', 'ethereum', 'binancecoin'];

  for (const symbol of symbols) {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: symbol,
        vs_currencies: 'usd',
        x_cg_demo_api_key: process.env.COINGECKO_API_KEY,
      }
    });

    const price = response.data[symbol].usd;

    const cacheKey = `price_${symbol}`;
    await redisClient.set(cacheKey, JSON.stringify(price), 'EX', 60);
    console.log(`Updated price for ${symbol}: ${price}`);
  }
};

export { updatePricesInCache, getCryptoPrice };
