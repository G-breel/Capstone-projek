<<<<<<< HEAD
const express = require("express");
const cors = require("cors");

const transaksiRoutes = require("./routes/transaksiRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/transaksi", transaksiRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
=======
const app = require('./src/app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Test database connection before starting server
testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
  });
>>>>>>> f767e41 (Update fitur auto-update wishlist dan perbaikan UI)
});