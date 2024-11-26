import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import {config} from 'dotenv'
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
config()
const app = express();
const PORT = process.env.PORT || 5000;
console.log(PORT);

// Middleware
app.use(cors({
    origin: [
      'https://randomstring.ngrok.app',
      'https://54a0-102-89-83-135.ngrok-free.app',
      'http://localhost:5173'
    ]
  }));
app.use(express.json());

// Configure upload directory
const __dirname = path.resolve(); // For ESM, resolve __dirname
const UPLOAD_FOLDER = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER);
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
});

// Upload file route
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
  });
});

// List files route
app.get("/", (req, res)=> {
    res.send('Hello world')
})
app.get('/files', (req, res) => {
  fs.readdir(UPLOAD_FOLDER, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read files' });
    }

    const fileDetails = files.map((filename) => {
      const filepath = path.join(UPLOAD_FOLDER, filename);
      const stats = fs.statSync(filepath);
      return {
        name: filename,
        size: stats.size,
      };
    });

    res.json({ files: fileDetails });
  });
});

// Download file route
app.get('/download/:filename', (req, res) => {
  const filepath = path.join(UPLOAD_FOLDER, req.params.filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filepath, (err) => {
    if (err) {
      res.status(500).json({ error: 'Could not download file' });
    }
  });
});

// Delete file route
app.delete('/delete/:filename', (req, res) => {
  const filepath = path.join(UPLOAD_FOLDER, req.params.filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  fs.unlink(filepath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not delete file' });
    }
    res.json({ message: 'File deleted successfully' });
  });
});

// Get server IP address
function getLocalIP() {
  const networks = os.networkInterfaces();
  for (const name of Object.keys(networks)) {
    for (const networkInterface of networks[name]) {
      const { address, internal, family } = networkInterface;
      if (!internal && family === 'IPv4') {
        return address;
      }
    }
  }
  return 'localhost';
}

// Start server
app.listen(PORT, () => {
  const localIP = getLocalIP();
  console.log(`Server running on http://${localIP}:${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
