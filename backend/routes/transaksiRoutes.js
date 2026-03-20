const express = require("express");
const router = express.Router();

const transaksiController = require("../controllers/transaksiController");

router.post("/tambah", transaksiController.tambahTransaksi);
router.get("/", transaksiController.getTransaksi);

module.exports = router;