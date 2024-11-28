import express from 'express';
import axios from 'axios';
import { performance } from 'perf_hooks';
import cluster from 'cluster';
import os from 'os';
import cors from 'cors'
import testRoutes from './routes/tester_routes.js';
import {config} from 'dotenv'
import { AppError } from './error/AppError.js';
config()



// Express server to host the testing tool
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({
    origin: [
      'https://randomstring.ngrok.app',
      'https://54a0-102-89-83-135.ngrok-free.app',
      'https://pl56tf0f-5173.uks1.devtunnels.ms',
      'https://pl56tf0f-5173.uks1.devtunnels.ms',
      'http://localhost:5173'
    ]
  }));

// API Testing Endpoints

app.use((req, res, next) => {
    console.log(`${req.method} ${req.hostname}${req.originalUrl}`);
    next();
  });

app.get('/', (req, res)=>{
    res.send('Hello word')
})
app.use('/api', testRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find method ${req.method} on ${req.originalUrl} on this server!`, 404));
  });
  

// Start server
app.listen(PORT, () => {
  console.log(`API Testing Tool running on port ${PORT}`);
});
