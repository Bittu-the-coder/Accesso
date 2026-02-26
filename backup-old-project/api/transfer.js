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








///////////version 2.0 ///////////////////
// // Add at the top of transfer.js
// const { get, set } = require('@vercel/edge-config');

// // Modified upload endpoint
// app.post('/api/upload', upload.single('file'), async (req, res) => {
//   const { id } = req.body;
//   const file = req.file;

//   if (!id || !file) {
//     return res.status(400).json({ error: 'ID and file are required' });
//   }

//   try {
//     const currentFiles = (await get(id)) || [];
//     currentFiles.push({
//       name: file.originalname,
//       url: `/api/download/${id}/${encodeURIComponent(file.name)}`,
//       timestamp: Date.now()
//     });

//     await set(id, currentFiles);
//     storage.get(id).push({
//       name: file.originalname,
//       data: file.buffer,
//       type: file.mimetype
//     });

//     res.json({ success: true, filename: file.originalname });
//   } catch (error) {
//     console.error('Edge Config error:', error);
//     res.status(500).json({ error: 'Storage error' });
//   }
// });


// const express = require('express');
// const multer = require('multer');
// const cors = require('cors');

// const app = express();

// // Enhanced CORS configuration
// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type']
// }));

// // Memory storage
// const storage = new Map();

// // Multer configuration
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 4 * 1024 * 1024 } // 4MB
// });

// // Upload endpoint
// app.post('/api/upload', upload.single('file'), (req, res) => {
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
//       type: file.mimetype
//     });

//     res.json({ success: true, filename: file.originalname });
//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(500).json({ error: 'Upload failed' });
//   }
// });

// // List files endpoint
// app.get('/api/files/:id', (req, res) => {
//   const { id } = req.params;
//   res.json({
//     files: (storage.get(id) || []).map(file => ({
//       name: file.name,
//       type: file.type
//     }))
//   });
// });

// // Download endpoint
// app.get('/api/download/:id/:filename', (req, res) => {
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

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok' });
// });

// module.exports = app;



//////////////version 3.0 /////////////
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

// Persistent storage simulation using JSON file
const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.join('/tmp', 'file-storage.json');

// Initialize storage
let storage = {};
if (fs.existsSync(STORAGE_FILE)) {
  storage = JSON.parse(fs.readFileSync(STORAGE_FILE));
}

function saveStorage() {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(storage));
}

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

    if (!storage[id]) {
      storage[id] = [];
    }

    const filename = `${uuidv4()}-${file.originalname}`;
    storage[id].push({
      filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer.toString('base64'),
      uploaded: new Date().toISOString()
    });

    saveStorage();

    res.json({
      success: true,
      filename: file.originalname,
      id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// List files endpoint
app.get('/api/files/:id', (req, res) => {
  try {
    const { id } = req.params;
    const files = storage[id] || [];

    res.json({
      files: files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        uploaded: file.uploaded
      }))
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Download endpoint
app.get('/api/download/:id/:filename', (req, res) => {
  try {
    const { id, filename } = req.params;
    const files = storage[id] || [];
    const file = files.find(f => f.filename === filename);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const buffer = Buffer.from(file.buffer, 'base64');

    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    storageStats: {
      ids: Object.keys(storage).length,
      totalFiles: Object.values(storage).reduce((sum, files) => sum + files.length, 0)
    }
  });
});

module.exports = app;