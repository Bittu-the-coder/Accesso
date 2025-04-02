// const express = require('express');
// const multer = require('multer');
// const cors = require('cors');

// const app = express();
// app.use(cors({
//   origin: ['https://accesso.vercel.app', 'http://localhost:3000'],
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type']
// }));

// // In-memory storage (volatile - resets on server restart)
// const storage = new Map();

// // Configure multer for memory storage (4MB limit)
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 4 * 1024 * 1024 }
// });

// // Upload endpoint
// app.post('/upload', upload.single('file'), (req, res) => {
//   try {
//     const { id } = req.body;
//     const file = req.file;

//     if (!id || !file) {
//       return res.status(400).json({ error: 'ID and file are required' });
//     }

//     if (!storage.has(id)) {
//       storage.set(id, []);
//     }

//     storage.get(id).push({
//       name: file.originalname,
//       data: file.buffer,
//       type: file.mimetype,
//       size: file.size,
//       uploaded: new Date().toISOString()
//     });

//     res.json({ success: true, filename: file.originalname });
//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(500).json({ error: 'Upload failed' });
//   }
// });

// // List files endpoint
// app.get('/files/:id', (req, res) => {
//   const { id } = req.params;
//   const files = storage.get(id) || [];

//   res.json({
//     files: files.map(file => ({
//       name: file.name,
//       size: file.size,
//       uploaded: file.uploaded
//     }))
//   });
// });

// // Download endpoint
// app.get('/download/:id/:filename', (req, res) => {
//   const { id, filename } = req.params;
//   const files = storage.get(id) || [];
//   const file = files.find(f => f.name === filename);

//   if (!file) {
//     return res.status(404).json({ error: 'File not found' });
//   }

//   res.setHeader('Content-Type', file.type);
//   res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
//   res.send(file.data);
// });

// module.exports = app;









// Add at the top of transfer.js
const { get, set } = require('@vercel/edge-config');

// Modified upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const { id } = req.body;
  const file = req.file;

  if (!id || !file) {
    return res.status(400).json({ error: 'ID and file are required' });
  }

  try {
    const currentFiles = (await get(id)) || [];
    currentFiles.push({
      name: file.originalname,
      url: `/api/download/${id}/${encodeURIComponent(file.originalname)}`,
      timestamp: Date.now()
    });

    await set(id, currentFiles);
    storage.get(id).push({
      name: file.originalname,
      data: file.buffer,
      type: file.mimetype
    });

    res.json({ success: true, filename: file.originalname });
  } catch (error) {
    console.error('Edge Config error:', error);
    res.status(500).json({ error: 'Storage error' });
  }
});


const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Memory storage
const storage = new Map();

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 } // 4MB
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    const { id } = req.body;
    const file = req.file;

    if (!id || !file) {
      return res.status(400).json({ error: 'ID and file are required' });
    }

    if (!storage.has(id)) {
      storage.set(id, []);
    }

    storage.get(id).push({
      name: file.originalname,
      data: file.buffer,
      type: file.mimetype
    });

    res.json({ success: true, filename: file.originalname });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// List files endpoint
app.get('/api/files/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    files: (storage.get(id) || []).map(file => ({
      name: file.name,
      type: file.type
    }))
  });
});

// Download endpoint
app.get('/api/download/:id/:filename', (req, res) => {
  const { id, filename } = req.params;
  const files = storage.get(id) || [];
  const file = files.find(f => f.name === filename);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.setHeader('Content-Type', file.type);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(file.data);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;