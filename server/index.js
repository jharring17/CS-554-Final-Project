// File to create an express server for the backend of the application.
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`http://localhost:${PORT}`);
});
