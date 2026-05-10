import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { wishlistService } from "../services/wishlistService";
import { transactionService } from "../services/transactionService";
import { DEBUG_MODE } from "../config/debugMode";
import { DUMMY_SUMMARY, DUMMY_WISHLIST } from "../data/dummyData";
import { formatRupiah } from "../utils/helpers";
import Modal from "../components/ui/Modal";
import Footer from "../components/layout/Footer";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const formatRupiahInput = (value) => {
  if (!value) return "";

  // Hanya ambil angka
  const number = value.toString().replace(/[^,\d]/g, "");
  const split = number.split(",");
  let sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
  return rupiah;
};

const parseRupiahToNumber = (rupiahString) => {
  if (!rupiahString) return 0;
  return parseInt(rupiahString.replace(/[^,\d]/g, "")) || 0;
};

export default function Wishlist() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [wishlists, setWishlists] = useState([]);
  const [summary, setSummary] = useState({ saldo: 0 });
  const [search, setSearch] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    savedAmount: "",
  });
  const [targetAmountDisplay, setTargetAmountDisplay] = useState("");
  const [savedAmountDisplay, setSavedAmountDisplay] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        fetchWishlists();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAllData = async () => {
    setLoading(true);

    if (DEBUG_MODE.ENABLED) {
      setTimeout(() => {
        setSummary({ saldo: DUMMY_SUMMARY.saldo });
        setWishlists(DUMMY_WISHLIST);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const [summaryRes, wishlistRes] = await Promise.all([
        transactionService.getSummary(),
        wishlistService.getWishlists(),
      ]);
      setSummary(summaryRes.data);
      setWishlists(wishlistRes.data);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlists = async () => {
    try {
      const res = await wishlistService.getWishlists(search);
      setWishlists(res.data);
    } catch (error) {
      toast.error("Gagal memuat wishlist");
    }
  };

  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      name: "",
      targetAmount: "",
      savedAmount: "0",
    });
    setTargetAmountDisplay("");
    setSavedAmountDisplay("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      targetAmount: item.target_amount.toString(),
      savedAmount: item.saved_amount.toString(),
    });
    setTargetAmountDisplay(formatRupiahInput(item.target_amount.toString()));
    setSavedAmountDisplay(formatRupiahInput(item.saved_amount.toString()));
    setModalOpen(true);
  };

  // Handler untuk input target amount
  const handleTargetAmountChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatRupiahInput(rawValue);
    const numericValue = parseRupiahToNumber(formatted);

    setTargetAmountDisplay(formatted);
    setFormData({ ...formData, targetAmount: numericValue.toString() });
  };

  // Handler untuk input saved amount
  const handleSavedAmountChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatRupiahInput(rawValue);
    const numericValue = parseRupiahToNumber(formatted);

    setSavedAmountDisplay(formatted);
    setFormData({ ...formData, savedAmount: numericValue.toString() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const target = parseInt(formData.targetAmount);
    const saved = parseInt(formData.savedAmount) || 0;

    if (!formData.name.trim()) {
      toast.error("Nama wishlist harus diisi");
      return;
    }
    if (!target || target <= 0) {
      toast.error("Target nominal harus lebih dari 0");
      return;
    }
    if (saved < 0) {
      toast.error("Nominal terkumpul tidak valid");
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: formData.name.trim(),
        targetAmount: target,
        savedAmount: saved,
      };

      if (editItem) {
        await wishlistService.updateWishlist(editItem.id, data);
        toast.success("Wishlist berhasil diupdate");
      } else {
        await wishlistService.createWishlist(data);
        toast.success("Wishlist berhasil ditambahkan");
      }

      setModalOpen(false);
      await fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus wishlist ini?")) return;

    setLoading(true);
    try {
      await wishlistService.deleteWishlist(id);
      toast.success("Wishlist berhasil dihapus");
      await fetchAllData();
    } catch (error) {
      toast.error("Gagal menghapus wishlist");
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (saved, target) => {
    if (!target) return 0;
    return Math.min(100, Math.round((saved / target) * 100));
  };

  if (loading && !modalOpen) {
    return <LoadingSpinner />;
  }

  return (
    <div className="text-white p-5 min-[901px]:p-8 animate-fade-in font-['Inter',_sans-serif]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h2 className="text-[28px] font-bold m-0">Wishlist Saya</h2>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold text-[15px] hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-lg"
        >
          + Tambah Wishlist
        </button>
      </div>

      <div className="bg-emerald-600 rounded-2xl py-5 px-6 mb-8">
        <p className="text-white/80 text-[13px] font-medium mb-1">Saldo Tersedia</p>
        <p className="text-[28px] font-bold m-0 tracking-tight">Rp {formatRupiah(summary.saldo)}</p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari wishlist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#2A2A2A] border border-white/5 text-white rounded-xl px-4 py-3.5 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all text-[15px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlists.length === 0 ? (
          <div className="col-span-full text-center py-16 text-white/30 border border-dashed border-white/10 rounded-2xl">
            Belum ada wishlist. Yuk buat wishlist pertama!
          </div>
        ) : (
          wishlists.map((item) => {
            const progress = calculateProgress(
              item.saved_amount,
              item.target_amount,
            );
            return (
              <div key={item.id} className="bg-gray-800 border border-white/5 rounded-2xl p-6 flex flex-col shadow-lg">
                <h3 className="text-[19px] font-bold text-white mb-4 m-0">{item.name}</h3>

                <div className="space-y-3 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-white/40">Target:</span>
                    <span className="font-bold">
                      Rp {formatRupiah(item.target_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Terkumpul:</span>
                    <span className="font-bold">
                      Rp {formatRupiah(item.saved_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sisa:</span>
                    <span className="font-bold">
                      Rp {formatRupiah(Math.max(0, item.target_amount - item.saved_amount))}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-white/30">PROGRESS</span>
                    <span className="text-white/60">{progress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="bg-emerald-500 rounded-full h-2 transition-all duration-700"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-6 mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="bg-transparent border-none text-blue-400 hover:text-blue-300 text-[14px] font-bold cursor-pointer transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-transparent border-none text-red-400 hover:text-red-300 text-[14px] font-bold cursor-pointer transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Wishlist" : "Tambah Wishlist"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              Nama Wishlist
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-gray-700 border-none text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-[15px]"
              placeholder="Contoh: Laptop Baru"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              Target Nominal
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/30">
                Rp
              </span>
              <input
                type="text"
                value={targetAmountDisplay}
                onChange={handleTargetAmountChange}
                placeholder="0"
                className="w-full bg-gray-700 border-none text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-[16px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              Sudah Terkumpul
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/30">
                Rp
              </span>
              <input
                type="text"
                value={savedAmountDisplay}
                onChange={handleSavedAmountChange}
                placeholder="0"
                className="w-full bg-gray-700 border-none text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-[16px]"
              />
            </div>
            <p className="text-[12px] text-white/30 mt-2">
              * Kosongi jika belum ada tabungan
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors text-[14px] font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-[14px] font-bold disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
