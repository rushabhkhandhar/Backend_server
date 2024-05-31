import redis from 'redis';


const redisClient = redis.createClient({
  url: process.env.REDIS_URI,
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error: ', err);
});

export default redisClient;
