const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { init } = require('./db');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api', routes);

// Serve static frontend when built and available
const frontendDist = path.join(__dirname, 'frontend', 'dist');
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true') {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API endpoint not found' });
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;

init().then(()=>{
  app.listen(PORT, ()=> console.log(`Backend listening on http://localhost:${PORT}`));
}).catch(err=>{
  console.error('DB init failed', err);
  process.exit(1);
});
