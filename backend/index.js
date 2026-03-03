const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { init } = require('./db');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api', routes);

const PORT = process.env.PORT || 4000;

init().then(()=>{
  app.listen(PORT, ()=> console.log(`Backend listening on http://localhost:${PORT}`));
}).catch(err=>{
  console.error('DB init failed', err);
  process.exit(1);
});
