import { useState, useEffect } from "react";

function App() {
  const [nominal, setNominal] = useState("");
  const [tipe, setTipe] = useState("masuk");
  const [keterangan, setKeterangan] = useState("");
  const [transaksi, setTransaksi] = useState([]);

  const ambilTransaksi = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/transaksi");
      const data = await res.json();
      setTransaksi(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    ambilTransaksi();
  }, []);

  const simpanTransaksi = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/transaksi/tambah", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipe: tipe,
          nominal: nominal,
          keterangan: keterangan,
        }),
      });

      const data = await response.json();
      alert(data.message);

      setNominal("");
      setKeterangan("");

      ambilTransaksi(); // refresh transaksi
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan transaksi");
    }
  };

  const saldo = transaksi.reduce((total, item) => {
  if (item.tipe === "masuk") {
    return total + Number(item.nominal);
  } else {
    return total - Number(item.nominal);
  }
}, 0);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Catatan Uang</h1>



<h2>Saldo Sekarang: Rp {saldo}</h2>



      <div>
        <input
          type="number"
          placeholder="Masukkan nominal"
          value={nominal}
          onChange={(e) => setNominal(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "10px" }}>
        <select value={tipe} onChange={(e) => setTipe(e.target.value)}>
          <option value="masuk">Uang Masuk</option>
          <option value="keluar">Uang Keluar</option>
        </select>
      </div>

      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          placeholder="Keterangan"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "10px" }}>
        <button onClick={simpanTransaksi}>Simpan</button>
      </div>

      <h2 style={{ marginTop: "30px" }}>Riwayat Transaksi</h2>

      <ul>
        {transaksi.map((item) => (
          <li key={item.id}>
            {item.tipe === "masuk" ? "+" : "-"} Rp {item.nominal} - {item.keterangan}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;