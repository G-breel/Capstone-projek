const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tabunganku",
});

db.connect((err) => {
  if (err) {
    console.log("Database gagal connect");
  } else {
    console.log("Database berhasil connect");
  }
});

module.exports = db;