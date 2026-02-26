const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const id = req.body.id;
    if (!id) {
      return cb(new Error('ID is required'), null);
    }

    const dir = path.join(__dirname, 'uploads', id);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    originalname: req.file.originalname
  });
});

// List files for an ID
app.get('/files/:id', (req, res) => {
  const id = req.params.id;
  const dir = path.join(__dirname, 'uploads', id);

  if (!fs.existsSync(dir)) {
    return res.status(404).json({ error: 'No files found for this ID' });
  }

  const files = fs.readdirSync(dir).map(file => {
    return {
      filename: file,
      originalname: file.split('-').slice(1).join('-') // Simple way to get original name
    };
  });

  res.json({ files });
});

// Download file
app.get('/download/:id/:filename', (req, res) => {
  const { id, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', id, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Extract original filename if possible
  const originalName = filename.split('-').slice(1).join('-');

  res.download(filePath, originalName, (err) => {
    if (err) {
      console.error('Download error:', err);
      res.status(500).json({ error: 'Error downloading file' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

