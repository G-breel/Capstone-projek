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
});