const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory data store for Vercel serverless
let dataStore = {};

// Initialize data on startup
const initializeData = async () => {
  try {
    // Try to read from data.json if it exists (local development)
    const DATA_FILE = path.join(__dirname, 'data.json');
    const content = await fs.readFile(DATA_FILE, 'utf8');
    dataStore = JSON.parse(content);
  } catch (err) {
    // Use default data if file doesn't exist
    dataStore = {
      mentor: {
        name: "Dr. Ananya Rao",
        designation: "Senior Academic Mentor",
        email: "ananya.rao@mentorship.edu",
        phone: "+91 98765 43210",
        photo: null,
        batches: ["B-2024-A", "B-2024-B", "B-2024-C"]
      },
      students: [],
      batches: [
        { id: "b1", name: "B-2024-A", year: "2024-2025" },
        { id: "b2", name: "B-2024-B", year: "2024-2025" },
        { id: "b3", name: "B-2024-C", year: "2024-2025" }
      ],
      notifications: [],
      activity: []
    };
  }
};

initializeData().catch(console.error);

app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/data', (req, res) => {
  try {
    res.json(dataStore);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to retrieve data' });
  }
});

app.get('/api/system', (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const osTotalMemory = os.totalmem();
    const osFreeMemory = os.freemem();
    const loadavg = os.loadavg();
    const uptime = process.uptime();
    res.json({ memoryUsage, osTotalMemory, osFreeMemory, loadavg, uptime, timestamp: Date.now() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to retrieve system metrics' });
  }
});

app.post('/api/save', (req, res) => {
  try {
    dataStore = req.body;
    // Try to persist to file in development
    if (process.env.NODE_ENV !== 'production') {
      const DATA_FILE = path.join(__dirname, 'data.json');
      fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf8').catch(console.error);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to save data' });
  }
});

app.post('/api/reset', (req, res) => {
  try {
    // Reset to default data
    dataStore = {
      mentor: {
        name: "Dr. Ananya Rao",
        designation: "Senior Academic Mentor",
        email: "ananya.rao@mentorship.edu",
        phone: "+91 98765 43210",
        photo: null,
        batches: ["B-2024-A", "B-2024-B", "B-2024-C"]
      },
      students: [],
      batches: [
        { id: "b1", name: "B-2024-A", year: "2024-2025" },
        { id: "b2", name: "B-2024-B", year: "2024-2025" },
        { id: "b3", name: "B-2024-C", year: "2024-2025" }
      ],
      notifications: [],
      activity: []
    };
    // Try to reset file in development
    if (process.env.NODE_ENV !== 'production') {
      const DATA_FILE = path.join(__dirname, 'data.json');
      fs.rm(DATA_FILE, { force: true }).catch(console.error);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to reset data' });
  }
});

// 404 handler for undefined API routes
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Mentorship backend running at http://localhost:${PORT}`);
});
