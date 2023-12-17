import express from 'express';
import cors from 'cors';
const app = express();
import redis from 'redis';
const client = redis.createClient();
client.connect().then(() => {});
app.use(cors());
import configRoutes from './routes/index.js';

app.use(express.json()); //***if you don't have this the request body will be undefined, this is what allows you to read the request body in a route

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});