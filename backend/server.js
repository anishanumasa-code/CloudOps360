const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: ['https://cloud-ops360.vercel.app', 'http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.get('/', (req, res) => {
  res.json({ status: "online", message: "CloudOps360 API is successfully connected!" });
});

app.get('/api/db-schema', (req, res) => {
  res.json({
    database: "PostgreSQL",
    status: "Healthy",
    entities: [
      { type: "User", attributes: ["id", "username", "email", "role"] },
      { type: "Server", attributes: ["instance_id", "region", "status"] }
    ]
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));