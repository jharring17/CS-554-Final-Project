// File to create an express server for the backend of the application.
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Define a default route
app.get('/', (req, res) => {
	res.status(200).send('The backend server is active.');
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`http://localhost:${PORT}`);
});
