
// instantiates and imports redis.js and promisify for asynchronous function 
import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    // Create a Redis client
    this.client = redis.createClient();

    // Promisify the get, set, and del methods to support async/await
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

    // Listen for error events and log them
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.connected = false;
    });

    // Track the connection status
    this.client.on('connect', () => {
      console.log('Redis client connected successfully.');
      this.connected = true;
    });

    // Initialize connection status
    this.connected = false;
  }

  // Function to check if Redis connection is alive
  isAlive() {
    return this.connected;
  }

  // Asynchronous function that gets the value of a key from Redis
  async get(key) {
    try {
      const value = await this.getAsync(key);
      return value;
    } catch (err) {
      console.error(`Error fetching key ${key}:`, err);
      return null;
    }
  }

  // Asynchronous function that sets a key-value pair in Redis with expiration
  async set(key, value, duration) {
    try {
      await this.setAsync(key, value, 'EX', duration);
      console.log(`Key ${key} set with expiration of ${duration} seconds.`);
    } catch (err) {
      console.error(`Error setting key ${key}:`, err);
    }
  }

  // Asynchronous function that deletes a key from Redis
  async del(key) {
    try {
      await this.delAsync(key);
      console.log(`Key ${key} deleted.`);
    } catch (err) {
      console.error(`Error deleting key ${key}:`, err);
    }
  }

  // Close Redis connection
  disconnect() {
    this.client.quit();
  }
}

// Creates and exports the instance of RedisClient
const redisClient = new RedisClient();
module.exports = redisClient;

