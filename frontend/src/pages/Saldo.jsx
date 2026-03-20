import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { transactionService } from '../services/transactionService'
import { wishlistService } from '../services/wishlistService'
import { formatRupiah, formatDate, getTodayISO } from '../utils/helpers'
import Modal from '../components/ui/Modal'
import Footer from '../components/layout/Footer'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Saldo() {
  const toast = useToast()
  
  // States
  const [loading, setLoading] = useState(true)
  const [pemasukan, setPemasukan] = useState([])
  const [pengeluaran, setPengeluaran] = useState([])
  const [summary, setSummary] = useState({ saldo: 0, pemasukan: 0, pengeluaran: 0 })
  const [wishlists, setWishlists] = useState([])
  
  // Filter states
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [pemasukanMonth, setPemasukanMonth] = useState(currentMonth)
  const [pengeluaranMonth, setPengeluaranMonth] = useState(currentMonth)
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('pemasukan')
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    date: getTodayISO(),
    amount: '',
    description: '',
    wishlistId: '' // <-- TAMBAHKAN INI
  })

  // Fetch data
  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    if (!loading) {
      fetchTransactions()
    }
  }, [pemasukanMonth, pengeluaranMonth])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [summaryRes, pemasukanRes, pengeluaranRes, wishlistRes] = await Promise.all([
        transactionService.getSummary(),
        transactionService.getTransactions({ type: 'pemasukan', month: pemasukanMonth }),
        transactionService.getTransactions({ type: 'pengeluaran', month: pengeluaranMonth }),
        wishlistService.getWishlists()
      ])
      
      setSummary(summaryRes.data)
      setPemasukan(pemasukanRes.data)
      setPengeluaran(pengeluaranRes.data)
      setWishlists(wishlistRes.data)
    } catch (error) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const [pemasukanRes, pengeluaranRes] = await Promise.all([
        transactionService.getTransactions({ type: 'pemasukan', month: pemasukanMonth }),
        transactionService.getTransactions({ type: 'pengeluaran', month: pengeluaranMonth })
      ])
      setPemasukan(pemasukanRes.data)
      setPengeluaran(pengeluaranRes.data)
    } catch (error) {
      toast.error('Gagal memuat transaksi')
    }
  }

  const openAddModal = (type) => {
    setModalType(type)
    setEditItem(null)
    setFormData({
      date: getTodayISO(),
      amount: '',
      description: '',
      wishlistId: '' // Reset wishlist
    })
    setModalOpen(true)
  }

  const openEditModal = (type, item) => {
    setModalType(type)
    setEditItem(item)
    setFormData({
      date: item.transaction_date,
      amount: item.amount,
      description: item.description,
      wishlistId: '' // Edit tidak update wishlist
    })
    setModalOpen(true)
  }

  // FUNGSI UPDATE WISHLIST MANUAL
  const updateWishlistManually = async (wishlistId, type, amount) => {
    if (!wishlistId) return null
    
    const wishlist = wishlists.find(w => w.id === parseInt(wishlistId))
    if (!wishlist) return null
    
    const currentSaved = wishlist.saved_amount
    let newSavedAmount
    
    if (type === 'pemasukan') {
      newSavedAmount = currentSaved + amount
    } else {
      newSavedAmount = Math.max(0, currentSaved - amount)
    }
    
    try {
      await wishlistService.updateWishlist(wishlistId, {
        name: wishlist.name,
        targetAmount: wishlist.target_amount,
        savedAmount: newSavedAmount
      })
      
      return {
        name: wishlist.name,
        oldAmount: currentSaved,
        newAmount: newSavedAmount
      }
    } catch (error) {
      console.error('Gagal update wishlist:', error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const amount = parseInt(formData.amount)
    if (!amount || amount <= 0) {
      toast.error('Nominal harus lebih dari 0')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Keterangan harus diisi')
      return
    }

    // Validasi saldo untuk pengeluaran baru
    if (modalType === 'pengeluaran' && !editItem && amount > summary.saldo) {
      toast.error('Saldo tidak cukup!')
      return
    }

    setLoading(true)
    try {
      const data = {
        type: modalType,
        amount,
        description: formData.description.trim(),
        transactionDate: formData.date
      }

      if (editItem) {
        // UPDATE: Edit transaksi
        await transactionService.updateTransaction(editItem.id, data)
        toast.success(`${modalType} berhasil diupdate`)
      } else {
        // CREATE: Tambah transaksi baru
        const transactionRes = await transactionService.createTransaction(data)
        toast.success(`${modalType} berhasil ditambahkan`)
        
        // *** UPDATE WISHLIST MANUAL jika dipilih ***
        if (formData.wishlistId) {
          try {
            const result = await updateWishlistManually(
              formData.wishlistId, 
              modalType, 
              amount
            )
            
            if (result) {
              toast.success(
                `✨ Tabungan "${result.name}" terupdate: ` +
                `Rp ${formatRupiah(result.oldAmount)} → Rp ${formatRupiah(result.newAmount)}`
              )
            }
          } catch (error) {
            toast.error('Gagal update wishlist, tapi transaksi tetap tersimpan')
          }
        }
      }

      setModalOpen(false)
      await fetchAllData() // Refresh data
      await fetchWishlists() // Refresh wishlists
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan')
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlists = async () => {
    try {
      const res = await wishlistService.getWishlists()
      setWishlists(res.data)
    } catch (error) {
      console.error('Gagal fetch wishlist:', error)
    }
  }

  const handleDelete = async (type, id) => {
    if (!window.confirm('Yakin ingin menghapus transaksi ini?')) return

    setLoading(true)
    try {
      await transactionService.deleteTransaction(id)
      toast.success('Transaksi berhasil dihapus')
      await fetchAllData()
    } catch (error) {
      toast.error('Gagal menghapus transaksi')
    } finally {
      setLoading(false)
    }
  }

  // Generate opsi bulan
  const monthOptions = () => {
    const options = []
    for (let i = 0; i < 6; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const value = `${year}-${month}`
      const label = new Intl.DateTimeFormat('id-ID', { 
        month: 'long', 
        year: 'numeric' 
      }).format(date)
      options.push({ value, label })
    }
    return options
  }

  // Render tabel transaksi
  const renderTable = (data, type, selectedMonth, setMonth) => (
    <div className="bg-[#555555] rounded-[18px] p-6 shadow-lg mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium text-white capitalize">{type}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => openAddModal(type)}
            className="bg-emerald-600 text-white px-3 py-1 rounded-full hover:bg-emerald-700 transition"
          >
            + Tambah
          </button>
          <select
            value={selectedMonth}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg"
          >
            {monthOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-right">Nominal</th>
              <th className="p-3 text-left">Keterangan</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-8 text-gray-400">
                  Belum ada data {type}
                </td>
              </tr>
            ) : (
              data.map(item => (
                <tr key={item.id} className="border-b border-gray-700">
                  <td className="p-3">{formatDate(item.transaction_date)}</td>
                  <td className="p-3 text-right font-mono">
                    Rp {formatRupiah(item.amount)}
                  </td>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => openEditModal(type, item)}
                      className="text-blue-400 hover:text-blue-300 mr-2 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(type, item.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (loading && !modalOpen) {
    return <LoadingSpinner />
  }

  return (
    <div className="text-white p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-600 rounded-xl p-6">
          <p className="text-sm opacity-90">Total Saldo</p>
          <p className="text-2xl font-bold">Rp {formatRupiah(summary.saldo)}</p>
        </div>
        <div className="bg-blue-600 rounded-xl p-6">
          <p className="text-sm opacity-90">Total Pemasukan</p>
          <p className="text-2xl font-bold">Rp {formatRupiah(summary.pemasukan)}</p>
        </div>
        <div className="bg-red-600 rounded-xl p-6">
          <p className="text-sm opacity-90">Total Pengeluaran</p>
          <p className="text-2xl font-bold">Rp {formatRupiah(summary.pengeluaran)}</p>
        </div>
      </div>

      {/* Tables */}
      {renderTable(pemasukan, 'pemasukan', pemasukanMonth, setPemasukanMonth)}
      {renderTable(pengeluaran, 'pengeluaran', pengeluaranMonth, setPengeluaranMonth)}

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editItem ? 'Edit' : 'Tambah'} ${modalType}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nominal (Rp)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              min="1"
              required
            />
          </div>
          
          {/* TAMBAHKAN DROPDOWN WISHLIST */}
          {!editItem && wishlists.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Hubungkan ke Wishlist (Opsional)
              </label>
              <select
                value={formData.wishlistId}
                onChange={(e) => setFormData({...formData, wishlistId: e.target.value})}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              >
                <option value="">-- Pilih Wishlist --</option>
                {wishlists.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Rp {formatRupiah(w.saved_amount)} / Rp {formatRupiah(w.target_amount)})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                💡 Pilih wishlist untuk update tabungan otomatis
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Keterangan
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              rows="3"
              placeholder="Contoh: Nabung buat Laptop"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  )
}