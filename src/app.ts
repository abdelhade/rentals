import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import rentalRoutes from './routes/rental.routes';
import suitRoutes from './routes/suit.routes';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Essential for strictly returning and parsing JSON format

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, '../public')));

// Default Ping Route
app.get('/', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Suit Rental System API is running.' });
});

// Routes
app.use('/api/rentals', rentalRoutes);
app.use('/api/suits', suitRoutes);

// General 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
