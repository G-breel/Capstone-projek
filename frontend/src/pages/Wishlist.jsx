<<<<<<< HEAD
import { useState, useMemo } from 'react'
import { mockTransactions, mockWishlist as initialWishlist } from '../utils/mockData'
import { formatRupiah, formatRupiahCompact } from '../utils/helpers'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/layout/Footer'

const Icon = ({ name, size = 16, className = '' }) => {
  switch (name) {
    case 'money': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
    case 'trending-down': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>;
    case 'search': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
    default: return null;
  }
}

export default function Wishlist() {
  const toast = useToast()
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState(initialWishlist)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  
  const [formName, setFormName] = useState('')
  const [formTarget, setFormTarget] = useState('')
  const [formSaved, setFormSaved] = useState('')

  const totalPemasukan = mockTransactions.pemasukan.reduce((s, t) => s + t.amount, 0)
  const totalPengeluaran = mockTransactions.pengeluaran.reduce((s, t) => s + t.amount, 0)
  const totalSaldo = totalPemasukan - totalPengeluaran

  const filtered = useMemo(() => {
    if (!search.trim()) return wishlist
    return wishlist.filter(w =>
      w.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [wishlist, search])

  function openAdd() {
    setEditItem(null)
    setFormName('')
    setFormTarget('')
    setFormSaved('')
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditItem(item)
    setFormName(item.name)
    setFormTarget(String(item.target))
    setFormSaved(String(item.saved))
    setModalOpen(true)
  }

  function handleSave(e) {
    e.preventDefault()
    const target = parseInt(formTarget)
    const saved = parseInt(formSaved) || 0
    if (!formName.trim()) { toast.error('Nama target harus diisi'); return }
    if (!target || target <= 0) { toast.error('Nominal target harus lebih dari 0'); return }
    if (saved < 0) { toast.error('Nominal terkumpul tidak valid'); return }

    if (editItem) {
      setWishlist(prev => prev.map(w =>
        w.id === editItem.id ? { ...w, name: formName.trim(), target, saved } : w
      ))
      toast.success('Wishlist berhasil diubah')
    } else {
      const newItem = {
        id: Date.now(),
        name: formName.trim(),
        target,
        saved,
      }
      setWishlist(prev => [...prev, newItem])
      toast.success('Wishlist baru berhasil ditambahkan!')
    }
    setModalOpen(false)
  }

  function handleDelete(id) {
    if (window.confirm('Yakin ingin menghapus wishlist ini?')) {
       setWishlist(prev => prev.filter(w => w.id !== id))
       toast.success('Wishlist berhasil dihapus')
    }
  }

  return (
    <div className="text-white pb-10 animate-fade-in">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 mb-6">
        
        {/* Card Dana Offline*/}
        <div className="relative h-[150px] rounded-[20px] py-6 px-[30px] flex flex-col justify-center overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] bg-[#739d34]">
           <div className="relative z-[2] flex justify-between items-start mb-[10px]">
              <span className="text-black text-[20px] font-['Inter',_sans-serif] font-medium">Dana Offline</span>
              <span className="opacity-80 text-black"><Icon name="money" size={28} /></span>
           </div>
           <div className="relative z-[2] text-black text-[30px] font-['Inter',_sans-serif] font-semibold">
             {formatRupiahCompact(totalSaldo)}
           </div>
           <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(102,102,102,0.4)_0%,rgba(0,0,0,0.5)_100%),linear-gradient(to_left,#8cff00,#8cff00)] opacity-80 z-[1]"></div>
        </div>
        
        {/* Card Pengeluaran*/}
        <div className="relative h-[150px] rounded-[20px] py-6 px-[30px] flex flex-col justify-center overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] bg-[#999]">
           <div className="relative z-[2] flex justify-between items-start mb-[10px]">
              <span className="text-black text-[20px] font-['Inter',_sans-serif] font-medium">Pengeluaran</span>
              <span className="opacity-80 text-black"><Icon name="trending-down" size={28} /></span>
           </div>
           <div className="relative z-[2] text-black text-[30px] font-['Inter',_sans-serif] font-semibold">
             {formatRupiahCompact(totalPengeluaran)}
           </div>
           <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(102,102,102,0.4)_0%,rgba(0,0,0,0.5)_100%),linear-gradient(to_left,#ffffff,#ffffff)] opacity-80 z-[1]"></div>
        </div>
      </div>

      <div className="bg-[#676464] bg-[linear-gradient(260.6deg,rgba(153,153,153,0.2)_0%,rgba(0,0,0,0.2)_100%)] rounded-[18px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] min-h-[500px] mt-6">
        <div className="flex justify-between items-center mb-5">
           <div className="font-['Inter',_sans-serif] text-[20px] text-white font-normal">[{filtered.length}] Barang</div>
           <button 
             className="bg-white text-[#319f43] border-none rounded-[10px] py-1.5 px-5 font-['Inter',_sans-serif] text-[14px] cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-opacity duration-200 hover:opacity-80" 
             onClick={openAdd}
           >
             Tambah
           </button>
        </div>
        
        <div className="relative max-w-[474px] mb-[30px]">
           <Icon name="search" size={20} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-black/50" />
           <input 
             type="text"
             className="w-full bg-[#c1d3c1] rounded-[100px] border-none py-3 pr-5 pl-10 text-black font-['Inter',_sans-serif] text-[16px] outline-none placeholder:text-black/50"
             placeholder="Cari Barang"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 max-h-[600px] overflow-y-auto pr-2.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
           {filtered.map(w => {
              const pct = w.target > 0 ? Math.min(100, Math.round((w.saved / w.target) * 100)) : 0;
              return (
                 <div key={w.id} className="bg-[#d9d9d9] rounded-[13px] p-4 flex flex-col gap-1.5 text-black transition-transform duration-200 hover:-translate-y-0.5">
                    <div className="font-['Inter',_sans-serif] text-[14px] mb-1 text-black font-semibold">{w.name}</div>
                    
                    <div className="flex items-center font-['Inter',_sans-serif] text-[11px]">
                       <span className="w-[60px] text-black/60">Target</span>
                       <span className="mr-1 text-black/60">:</span>
                       <span className="text-black/80">{formatRupiah(w.target)}</span>
                    </div>
                    <div className="flex items-center font-['Inter',_sans-serif] text-[11px]">
                       <span className="w-[60px] text-black/60">Terkumpul</span>
                       <span className="mr-1 text-black/60">:</span>
                       <span className="text-black/80">{formatRupiah(w.saved)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1.5 font-['Inter',_sans-serif]">
                       <span className="text-[13px] text-black w-[60px]">Progress:</span>
                       <div className="flex-1 bg-black/10 h-3 rounded-md overflow-hidden">
                          <div className="h-full bg-[#39dc31] rounded-md" style={{ width: `${pct}%` }}></div>
                       </div>
                       <span className="text-[10px] text-black">{pct}%</span>
                    </div>
                    
                    <div className="flex justify-between mt-auto pt-2.5">
                       <button className="bg-transparent border-none text-[10px] font-['Inter',_sans-serif] text-black cursor-pointer p-0 font-normal hover:underline" onClick={() => openEdit(w)}>[ Update Tabungan ]</button>
                       <button className="bg-transparent border-none text-[10px] font-['Inter',_sans-serif] text-black cursor-pointer p-0 font-normal hover:underline" onClick={() => handleDelete(w.id)}>[ Hapus ]</button>
                    </div>
                 </div>
              )
           })}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Update Tabungan' : 'Tambah Wishlist'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-['Inter',_sans-serif] text-[14px]">Nama Barang</label>
            <input 
              type="text" 
              className="bg-[#d9d9d9]/40 border border-white/10 rounded-[10px] py-2.5 px-3.5 text-white font-['Inter',_sans-serif] text-[14px] outline-none placeholder:text-white/60 focus:border-white/30" 
              value={formName} 
              onChange={e => setFormName(e.target.value)} 
              required 
              placeholder="Contoh: Laptop Impian" 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-['Inter',_sans-serif] text-[14px]">Target Harga (Rp)</label>
            <input 
              type="number" 
              className="bg-[#d9d9d9]/40 border border-white/10 rounded-[10px] py-2.5 px-3.5 text-white font-['Inter',_sans-serif] text-[14px] outline-none placeholder:text-white/60 focus:border-white/30" 
              value={formTarget} 
              onChange={e => setFormTarget(e.target.value)} 
              required min="1" 
              placeholder="Contoh: 14000000" 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-['Inter',_sans-serif] text-[14px]">Terkumpul (Rp)</label>
            <input 
              type="number" 
              className="bg-[#d9d9d9]/40 border border-white/10 rounded-[10px] py-2.5 px-3.5 text-white font-['Inter',_sans-serif] text-[14px] outline-none placeholder:text-white/60 focus:border-white/30" 
              value={formSaved} 
              onChange={e => setFormSaved(e.target.value)} 
              min="0" 
              placeholder="Opsional" 
            />
          </div>
          <div className="flex justify-end mt-4">
             <button type="submit" className="bg-[linear-gradient(85.95deg,#319f43_17%,#62bd71_69%)] rounded-[20px] border-none text-white py-2 px-6 font-['Inter',_sans-serif] text-[14px] cursor-pointer transition-opacity duration-200 hover:opacity-90">
               Simpan
             </button>
          </div>
        </form>
      </Modal>
      <Footer />
    </div>
  )
}
=======
import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { wishlistService } from "../services/wishlistService";
import { transactionService } from "../services/transactionService";
import { formatRupiah } from "../utils/helpers";
import Modal from "../components/ui/Modal";
import Footer from "../components/layout/Footer";
import LoadingSpinner from "../components/ui/LoadingSpinner";

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
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      targetAmount: item.target_amount,
      savedAmount: item.saved_amount,
    });
    setModalOpen(true);
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
    <div className="text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Wishlist Saya</h2>
        <button
          onClick={openAddModal}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
        >
          + Tambah Wishlist
        </button>
      </div>

      {/* Saldo Info */}
      <div className="bg-emerald-600 rounded-xl p-4 mb-6">
        <p className="text-sm opacity-90">Saldo Tersedia</p>
        <p className="text-2xl font-bold">Rp {formatRupiah(summary.saldo)}</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari wishlist..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
        />
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlists.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            Belum ada wishlist. Yuk buat wishlist pertama!
          </div>
        ) : (
          wishlists.map((item) => {
            const progress = calculateProgress(
              item.saved_amount,
              item.target_amount,
            );
            return (
              <div key={item.id} className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target:</span>
                    {/* PERBAIKAN: Hapus 'Rp' manual, pake fungsi formatRupiah aja */}
                    <span className="font-mono">
                      Rp {formatRupiah(item.target_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Terkumpul:</span>
                    <span className="font-mono">
                      Rp {formatRupiah(item.saved_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sisa:</span>
                    <span className="font-mono">
                      Rp {formatRupiah(item.target_amount - item.saved_amount)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>
                      {Math.min(
                        100,
                        Math.round(
                          (item.saved_amount / item.target_amount) * 100,
                        ),
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-emerald-500 rounded-full h-2 transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((item.saved_amount / item.target_amount) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(item)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Wishlist" : "Tambah Wishlist"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nama Wishlist
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              placeholder="Contoh: Laptop Baru"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Target Nominal (Rp)
            </label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) =>
                setFormData({ ...formData, targetAmount: e.target.value })
              }
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Sudah Terkumpul (Rp)
            </label>
            <input
              type="number"
              value={formData.savedAmount}
              onChange={(e) =>
                setFormData({ ...formData, savedAmount: e.target.value })
              }
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              min="0"
            />
            <p className="text-xs text-gray-400 mt-1">
              *Kosongi jika belum ada tabungan
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
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
>>>>>>> f767e41 (Update fitur auto-update wishlist dan perbaikan UI)
