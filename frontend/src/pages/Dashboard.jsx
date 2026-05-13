import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatRupiah, formatRupiahCompact, getTodayISO } from '../utils/helpers'
import { transactionService } from '../services/transactionService'
import { wishlistService } from '../services/wishlistService'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate, Link } from 'react-router-dom'
import Footer from '../components/layout/Footer'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorDisplay from '../components/ui/ErrorDisplay'
import Modal from '../components/ui/Modal'
import { DEBUG_MODE } from '../config/debugMode'
import { DUMMY_SUMMARY, DUMMY_CHART, DUMMY_WISHLIST } from '../data/dummyData'

const formatRupiahInput = (value) => {
  if (!value) return ''
  const number = value.toString().replace(/[^,\d]/g, '')
  const split = number.split(',')
  let sisa = split[0].length % 3
  let rupiah = split[0].substr(0, sisa)
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi)
  if (ribuan) {
    const separator = sisa ? '.' : ''
    rupiah += separator + ribuan.join('.')
  }
  rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah
  return rupiah
}

const parseRupiahToNumber = (rupiahString) => {
  if (!rupiahString) return 0
  return parseInt(rupiahString.replace(/[^,\d]/g, '')) || 0
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState({
    pemasukan: 0,
    pengeluaran: 0,
    saldo: 0
  })
  const [chartData, setChartData] = useState({
    pemasukan: [],
    pengeluaran: []
  })
  const [wishlists, setWishlists] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [monthlySummary, setMonthlySummary] = useState({ pemasukan: 0, pengeluaran: 0, saldo: 0 })
  const [dashSearch, setDashSearch] = useState('')

  // Quick-add modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('pemasukan')
  const [formData, setFormData] = useState({ amount: '', description: '', date: getTodayISO() })
  const [amountDisplay, setAmountDisplay] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    fetchDashboardData(true)
  }, [selectedYear])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(false)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [selectedYear])

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)
    
    // MOCK DATA UNTUK LOCALHOST (Mencegah error API karena bypass login)
    if (DEBUG_MODE.ENABLED) {
      setTimeout(() => {
        setSummary(DUMMY_SUMMARY)
        setChartData(DUMMY_CHART)
        setWishlists(DUMMY_WISHLIST)
        setMonthlySummary({
          pemasukan: DUMMY_SUMMARY.pemasukan,
          pengeluaran: DUMMY_SUMMARY.pengeluaran,
          saldo: DUMMY_SUMMARY.saldo
        })
        if (showLoading) setLoading(false)
      }, 500)
      return
    }

    try {
      const d = new Date()
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const [summaryRes, chartRes, wishlistRes, monthRes] = await Promise.all([
        transactionService.getSummary(),
        transactionService.getChartData(selectedYear),
        wishlistService.getWishlists(),
        transactionService.getSummary(monthKey)
      ])

      setSummary(summaryRes.data)
      setChartData(chartRes.data)
      setWishlists(wishlistRes.data)
      setMonthlySummary(monthRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data dashboard')
      console.error('Error fetching dashboard:', err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const openModal = (type) => {
    setModalType(type)
    setFormData({ amount: '', description: '', date: getTodayISO() })
    setAmountDisplay('')
    setModalOpen(true)
  }

  const handleAmountChange = (e) => {
    const formatted = formatRupiahInput(e.target.value)
    const numericValue = parseRupiahToNumber(formatted)
    setAmountDisplay(formatted)
    setFormData((prev) => ({ ...prev, amount: numericValue.toString() }))
  }

  const handleQuickSubmit = async (e) => {
    e.preventDefault()
    const amount = parseInt(formData.amount, 10)
    if (!amount || amount <= 0) {
      toast.error('Nominal harus lebih dari 0')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Keterangan harus diisi')
      return
    }
    if (modalType === 'pengeluaran' && amount > summary.saldo) {
      toast.error('Saldo tidak cukup!')
      return
    }
    setSubmitLoading(true)
    try {
      await transactionService.createTransaction({
        type: modalType,
        amount,
        description: formData.description.trim(),
        transactionDate: formData.date
      })
      toast.success(`${modalType} berhasil ditambahkan`)
      setModalOpen(false)
      await fetchDashboardData(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan')
    } finally {
      setSubmitLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-white/10 bg-[#1a211c] px-[14px] py-2 text-[12px] font-semibold text-white shadow-lg shadow-black/40">
          Rp {formatRupiah(payload[0].value)}
        </div>
      )
    }
    return null
  }

  const calculateProgress = (saved, target) => {
    if (!target) return 0
    return Math.min(100, Math.round((saved / target) * 100))
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <ErrorDisplay message={error} onRetry={fetchDashboardData} />
      </div>
    )
  }

  return (
    <div className="text-white pb-10 animate-fade-in">
      <h3 className="text-[28px] md:text-[32px] font-normal text-white m-0 mb-1">
        Hi, {user?.name || 'user'}
      </h3>
      <p className="font-['Inter',_sans-serif] text-[14px] text-white/80 mb-[30px] -mt-[15px]">
        Welcome back to Dashboard!
      </p>

      {/* Quick Add Buttons */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => openModal('pemasukan')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_28px_rgba(16,185,129,0.22)] transition hover:brightness-110"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Pemasukan
        </button>
        <button
          onClick={() => openModal('pengeluaran')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_28px_rgba(248,113,113,0.22)] transition hover:brightness-110"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Pengeluaran
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="relative h-[110px] md:h-[130px] rounded-2xl p-4 md:p-6 flex flex-col justify-center overflow-hidden shadow-[0_12px_40px_rgba(16,185,129,0.25)] ring-1 ring-white/10 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-800">
          <div className="relative z-[2] flex justify-between items-start mb-2">
            <span className="text-emerald-50 text-[13px] md:text-[15px] font-medium opacity-90">Total Saldo</span>
            <span className="text-emerald-200/50">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth={2}></rect>
                <circle cx="12" cy="12" r="2" strokeWidth={2}></circle>
                <path d="M6 12h.01M18 12h.01" strokeWidth={2}></path>
              </svg>
            </span>
          </div>
          <div className="relative z-[2] text-white text-[22px] md:text-[32px] font-bold">
            Rp {formatRupiah(summary.saldo)}
          </div>
        </div>

        <div className="relative h-[110px] md:h-[130px] rounded-2xl p-4 md:p-6 flex flex-col justify-center overflow-hidden shadow-[0_12px_40px_rgba(59,130,246,0.2)] ring-1 ring-white/10 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-900">
          <div className="relative z-[2] flex justify-between items-start mb-2">
            <span className="text-blue-50 text-[13px] md:text-[15px] font-medium opacity-90">Total Pemasukan</span>
            <span className="text-blue-200/50">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeWidth={2}></polyline>
                <polyline points="17 6 23 6 23 12" strokeWidth={2}></polyline>
              </svg>
            </span>
          </div>
          <div className="relative z-[2] text-white text-[22px] md:text-[32px] font-bold">
            Rp {formatRupiah(summary.pemasukan)}
          </div>
        </div>
        
        <div className="relative h-[110px] md:h-[130px] rounded-2xl p-4 md:p-6 flex flex-col justify-center overflow-hidden shadow-[0_12px_40px_rgba(248,113,113,0.18)] ring-1 ring-white/10 bg-gradient-to-br from-rose-600 via-red-700 to-red-950">
          <div className="relative z-[2] flex justify-between items-start mb-2">
            <span className="text-red-50 text-[13px] md:text-[15px] font-medium opacity-90">Total Pengeluaran</span>
            <span className="text-red-200/50">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" strokeWidth={2}></polyline>
                <polyline points="17 18 23 18 23 12" strokeWidth={2}></polyline>
              </svg>
            </span>
          </div>
          <div className="relative z-[2] text-white text-[22px] md:text-[32px] font-bold">
            Rp {formatRupiah(summary.pengeluaran)}
          </div>
        </div>
      </div>

      <div className="tq-card mt-5 p-5 md:p-6">
        <h3 className="m-0 text-[16px] font-semibold tracking-tight text-white">Rangkuman bulan berjalan</h3>
        <p className="mt-1 text-[13px] text-white/50">
          Pemasukan & pengeluaran bulan ini; cari keterangan lalu buka di Histori.
        </p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="m-0 text-[12px] text-white/45">Pemasukan (bulan ini)</p>
              <p className="m-0 text-[18px] font-bold text-emerald-400">Rp {formatRupiah(monthlySummary.pemasukan)}</p>
            </div>
            <div>
              <p className="m-0 text-[12px] text-white/45">Pengeluaran (bulan ini)</p>
              <p className="m-0 text-[18px] font-bold text-red-400">Rp {formatRupiah(monthlySummary.pengeluaran)}</p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 md:max-w-md md:flex-row">
            <input
              type="search"
              value={dashSearch}
              onChange={(e) => setDashSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && dashSearch.trim()) {
                  navigate(`/histori?search=${encodeURIComponent(dashSearch.trim())}`)
                }
              }}
              placeholder="Cari transaksi (keterangan)..."
              className="tq-field min-w-0 flex-1 rounded-xl px-4 py-2.5 text-[14px]"
            />
            <Link
              to={dashSearch.trim() ? `/histori?search=${encodeURIComponent(dashSearch.trim())}` : '/histori'}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_28px_rgba(16,185,129,0.22)] transition hover:brightness-110"
            >
              Buka Histori
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start mt-6">
        
        <div className="flex flex-col gap-6">

          <div className="tq-card relative p-6">
            <div className="pointer-events-none absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent" aria-hidden />
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <h3 className="font-['Inter',_sans-serif] text-[16px] font-semibold text-white m-0 tracking-tight">Pemasukan {selectedYear}</h3>
              <select 
                className="tq-field tq-select py-2 px-3 text-[14px] cursor-pointer font-['Inter',_sans-serif]"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {[2026, 2025, 2024, 2023].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData.pemasukan} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={true} 
                    tickLine={false} 
                    tick={{ fill: 'white', fontSize: 13, fontFamily: 'Inter' }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={true} 
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fill: 'white', fontSize: 13, fontFamily: 'Inter' }} 
                    tickFormatter={(v) => {
                      if (v === 0) return '0'
                      if (v >= 1000000) return `${v / 1000000}jt`
                      if (v >= 1000) return `${v / 1000}k`
                      return v
                    }} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} name="Pemasukan" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="tq-card relative p-6">
            <div className="pointer-events-none absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent" aria-hidden />
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <h3 className="font-['Inter',_sans-serif] text-[16px] font-semibold text-white m-0 tracking-tight">Pengeluaran {selectedYear}</h3>
              <select 
                className="tq-field tq-select py-2 px-3 text-[14px] cursor-pointer font-['Inter',_sans-serif]"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {[2026, 2025, 2024, 2023].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData.pengeluaran} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={true} 
                    tickLine={false} 
                    tick={{ fill: 'white', fontSize: 13, fontFamily: 'Inter' }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={true} 
                    tickLine={false} 
                    allowDecimals={false}
                    tick={{ fill: 'white', fontSize: 13, fontFamily: 'Inter' }} 
                    tickFormatter={(v) => {
                      if (v === 0) return '0'
                      if (v >= 1000000) return `${v / 1000000}jt`
                      if (v >= 1000) return `${v / 1000}k`
                      return v
                    }} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="tq-card relative flex h-[500px] flex-col p-6 lg:h-[850px]">
            <div className="pointer-events-none absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-teal-400/35 to-transparent" aria-hidden />
            <h3 className="font-['Inter',_sans-serif] text-[16px] font-semibold tracking-tight text-white m-0 mb-4">Wishlist</h3>
            
            {wishlists.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-white/50">
                <p className="mb-4">Belum ada wishlist</p>
                <button 
                  onClick={() => navigate('/wishlist')}
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-white/[0.12]"
                >
                  Tambah Wishlist
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 overflow-y-auto pr-3 flex-1 
                [&::-webkit-scrollbar]:w-[6px] 
                [&::-webkit-scrollbar-track]:bg-white/10 [&::-webkit-scrollbar-track]:rounded-[10px] 
                [&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-thumb]:rounded-[10px] hover:[&::-webkit-scrollbar-thumb]:bg-white/50
                [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.4)_rgba(255,255,255,0.1)]"
              >
                {wishlists.slice(0, 5).map(item => {
                  const progress = calculateProgress(item.saved_amount, item.target_amount)
                  return (
                    <div key={item.id} className="tq-card-inner shrink-0 rounded-xl p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <h4 className="text-[17px] font-bold m-0 mb-4 font-['Inter',_sans-serif] text-white/90 truncate">{item.name}</h4>
                      <div className="text-[13px] space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-white/40">Target:</span> 
                          <span className="font-bold text-white/90">Rp {formatRupiah(item.target_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/40">Terkumpul:</span> 
                          <span className="font-bold text-white/90">Rp {formatRupiah(item.saved_amount)}</span>
                        </div>
                      </div>
                      <div className="mt-5">
                        <div className="flex justify-between text-[11px] mb-1.5 font-bold">
                          <span className="text-white/30 uppercase tracking-widest">Progress</span>
                          <span className="text-white/60">{progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-5">
                        <button 
                          className="bg-transparent border-none text-blue-400 hover:text-blue-300 text-[13px] font-bold cursor-pointer transition-colors" 
                          onClick={() => navigate('/wishlist')}
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />

      {/* Quick Add Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Tambah ${modalType === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}`}
      >
        <form onSubmit={handleQuickSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] text-white/60 mb-1.5">Tanggal</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="tq-field w-full rounded-xl px-4 py-2.5 text-[14px]"
              required
            />
          </div>
          <div>
            <label className="block text-[13px] text-white/60 mb-1.5">Nominal (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={amountDisplay}
              onChange={handleAmountChange}
              placeholder="0"
              className="tq-field w-full rounded-xl px-4 py-2.5 text-[14px]"
              required
            />
          </div>
          <div>
            <label className="block text-[13px] text-white/60 mb-1.5">Keterangan</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Masukkan keterangan..."
              rows={3}
              className="tq-field w-full rounded-xl px-4 py-2.5 text-[14px] resize-none"
              required
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.06] py-2.5 text-[14px] font-medium text-white transition hover:bg-white/[0.12]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className={`flex-1 rounded-xl py-2.5 text-[14px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60 ${
                modalType === 'pemasukan'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_8px_28px_rgba(16,185,129,0.22)]'
                  : 'bg-gradient-to-r from-rose-600 to-red-700 shadow-[0_8px_28px_rgba(248,113,113,0.22)]'
              }`}
            >
              {submitLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}