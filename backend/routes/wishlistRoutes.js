const express = require("express");
const router = express.Router();
const transaksiController = require("../controllers/transaksiController");

router.post("/tambah", transaksiController.tambahTransaksi);

module.exports = router;