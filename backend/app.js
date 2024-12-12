import express from 'express';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import userRoutes from './routes/route.js';
import cors from 'cors'

const app = express();

app.use(bodyParser.json());
app.use(cors());
connectDB();

app.use('/api', userRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`port - ${PORT}`);
});
