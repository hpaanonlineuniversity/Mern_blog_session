//configs/redis.js

import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import { REDIS_PASSWORD } from './config.js';

// Initialize the Redis client.
const redisClient = createClient({
  url: `redis://default:${REDIS_PASSWORD}@redis:6379`
});

// Connect to Redis
redisClient.connect()
  .then(() => console.log('Connected to Redis'))
  .catch((err) => console.error('Redis connection error:', err));

// Initialize the session store with the Redis client.
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "app:",
});

export { redisClient, redisStore };
