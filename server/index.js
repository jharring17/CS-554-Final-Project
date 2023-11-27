// // File to create an express server for the backend of the application.
// import express from 'express';

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Define a default route
// app.get('/', (req, res) => {
// 	res.status(200).send('The backend server is active.');
// });

// // Start the server
// app.listen(PORT, () => {
// 	console.log(`Server is running on port ${PORT}`);
// 	console.log(`http://localhost:${PORT}`);
// });

import express from 'express';
const app = express();
import configRoutes from './routes/index.js';

app.use(express.json()); //***if you don't have this the request body will be undefined, this is what allows you to read the request body in a route

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});