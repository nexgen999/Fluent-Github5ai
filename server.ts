import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import mime from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure 'files' directory exists
  const filesDir = path.join(__dirname, 'files');
  try {
    await fs.access(filesDir);
  } catch {
    await fs.mkdir(filesDir);
    // Create some placeholder files
    await fs.writeFile(path.join(filesDir, 'hello.txt'), 'Hello World!');
    await fs.writeFile(path.join(filesDir, 'resume.pdf'), 'Dummy PDF content');
    await fs.mkdir(path.join(filesDir, 'images'));
    await fs.writeFile(path.join(filesDir, 'images', 'profile.jpg'), 'Dummy image');
  }

  // API to list files
  app.get('/api/files', async (req, res) => {
    try {
      const targetPath = req.query.path ? String(req.query.path) : '';
      const fullPath = path.join(filesDir, targetPath);

      // Prevent directory traversal
      if (!fullPath.startsWith(filesDir)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        return res.status(400).json({ error: 'Not a directory' });
      }

      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      const results = await Promise.all(entries.map(async (entry) => {
        const entryPath = path.join(fullPath, entry.name);
        const entryStats = await fs.stat(entryPath);
        return {
          name: entry.name,
          isDirectory: entry.isDirectory(),
          size: entryStats.size,
          mtime: entryStats.mtime,
          mime: entry.isDirectory() ? 'directory' : (mime.lookup(entry.name) || 'application/octet-stream')
        };
      }));

      res.json({
        currentPath: targetPath,
        files: results
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to read directory' });
    }
  });

  // Serve static files from the files directory
  app.use('/files', express.static(filesDir));

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
