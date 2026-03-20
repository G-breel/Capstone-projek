const db = require("../config/db");

exports.tambahTransaksi = (req, res) => {
  const { tipe, nominal, keterangan } = req.body;

  const sql = "INSERT INTO transaksi (tipe, nominal, keterangan) VALUES (?, ?, ?)";

  db.query(sql, [tipe, nominal, keterangan], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.json({ message: "Transaksi berhasil disimpan" });
  });
};

exports.getTransaksi = (req, res) => {
  const sql = "SELECT * FROM transaksi ORDER BY tanggal DESC";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.json(result);
  });
};