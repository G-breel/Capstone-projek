import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { formatRupiahCompact } from '../utils/helpers'
import { transactionService } from '../services/transactionService'
import { wishlistService } from '../services/wishlistService'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/layout/Footer'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorDisplay from '../components/ui/ErrorDisplay'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // States
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
  
  // TAMBAHKAN INI - State untuk selected year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [selectedYear]) // <-- selectedYear sebagai dependency

  // TAMBAHKAN INI - Refresh periodik setiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [selectedYear])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch all data in parallel
      const [summaryRes, chartRes, wishlistRes] = await Promise.all([
        transactionService.getSummary(),
        transactionService.getChartData(selectedYear), // <-- pakai selectedYear
        wishlistService.getWishlists()
      ])

      setSummary(summaryRes.data)
      setChartData(chartRes.data)
      setWishlists(wishlistRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data dashboard')
      console.error('Error fetching dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#2A2A2A] py-2 px-[14px] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.5)] text-[12px] font-semibold text-white border border-white/10">
          {formatRupiahCompact(payload[0].value)}
        </div>
      )
    }
    return null
  }

  // Hitung progress wishlist
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

      {/* Summary Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        
        {/* Card Dana Offline */}
        <div className="relative h-[150px] rounded-[20px] p-6 flex flex-col justify-center overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] bg-[#739d34]">
          <div className="relative z-[2] flex justify-between items-start mb-[10px]">
            <span className="text-black text-[20px] font-['Inter',_sans-serif] font-medium">Dana Offline</span>
            <span className="text-[28px] opacity-80 text-black">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <circle cx="12" cy="12" r="2"></circle>
                <path d="M6 12h.01M18 12h.01"></path>
              </svg>
            </span>
          </div>
          <div className="relative z-[2] text-black text-[30px] font-['Inter',_sans-serif] font-semibold">
            {formatRupiahCompact(summary.saldo)}
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(102,102,102,0.4)_0%,rgba(0,0,0,0.5)_100%),linear-gradient(to_left,#8cff00,#8cff00)] opacity-80 z-[1]"></div>
        </div>
        
        {/* Card Pengeluaran */}
        <div className="relative h-[150px] rounded-[20px] p-6 flex flex-col justify-center overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] bg-[#999]">
          <div className="relative z-[2] flex justify-between items-start mb-[10px]">
            <span className="text-black text-[20px] font-['Inter',_sans-serif] font-medium">Pengeluaran</span>
            <span className="text-[28px] opacity-80 text-black">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                <polyline points="17 18 23 18 23 12"></polyline>
              </svg>
            </span>
          </div>
          <div className="relative z-[2] text-black text-[30px] font-['Inter',_sans-serif] font-semibold">
            {formatRupiahCompact(summary.pengeluaran)}
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(102,102,102,0.4)_0%,rgba(0,0,0,0.5)_100%),linear-gradient(to_left,#ffffff,#ffffff)] opacity-80 z-[1]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start mt-6">
        
        {/* Charts Section */}
        <div className="flex flex-col gap-6">

          {/* Pemasukan Chart */}
          <div className="bg-[#555555] bg-[linear-gradient(260deg,rgba(0,0,0,0.2)_60%,rgba(153,153,153,0.2)_100%)] rounded-[18px] p-6 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-['Inter',_sans-serif] text-[16px] font-medium text-white m-0">Pemasukan {selectedYear}</h3>
              <select 
                className="bg-[#8f8f8f] text-white border-none py-1 px-3 rounded-lg font-['Inter',_sans-serif] text-[14px] outline-none cursor-pointer"
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
                    tick={{ fill: 'white', fontSize: 13, fontFamily: 'Inter' }} 
                    tickFormatter={v => v >= 1000000 ? `${v/1000000}jt` : `${v/1000}k`} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="amount" fill="#d9d9d9" radius={[2, 2, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pengeluaran Chart */}
          <div className="bg-[#555555] bg-[linear-gradient(260deg,rgba(0,0,0,0.2)_60%,rgba(153,153,153,0.2)_100%)] rounded-[18px] p-6 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-['Inter',_sans-serif] text-[16px] font-medium text-white m-0">Pengeluaran {selectedYear}</h3>
              <select 
                className="bg-[#8f8f8f] text-white border-none py-1 px-3 rounded-lg font-['Inter',_sans-serif] text-[14px] outline-none cursor-pointer"
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
                    tick={{ fill: 'white', fontSize: 13, fontFamily: 'Inter' }} 
                    tickFormatter={v => v >= 1000000 ? `${v/1000000}jt` : `${v/1000}k`} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="amount" fill="#d9d9d9" radius={[2, 2, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Wishlist Sidebar Section */}
        <div className="w-full">
          <div className="bg-[#555555] bg-[linear-gradient(260deg,rgba(0,0,0,0.2)_60%,rgba(153,153,153,0.2)_100%)] rounded-[18px] p-6 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative h-[500px] lg:h-[850px] flex flex-col">
            <h3 className="font-['Inter',_sans-serif] text-[16px] font-medium text-white m-0 mb-4">Wishlist</h3>
            
            {wishlists.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-white/50">
                <p className="mb-4">Belum ada wishlist</p>
                <button 
                  onClick={() => navigate('/wishlist')}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
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
                    <div key={item.id} className="bg-[#d9d9d9] rounded-[13px] p-4 text-black shrink-0">
                      <h4 className="text-[14px] font-semibold m-0 mb-[10px] font-['Inter',_sans-serif]">{item.name}</h4>
                      <div className="text-[11px] leading-[1.4] text-[#444]">
                        <div>
                          <span className="inline-block w-[60px] font-semibold text-[#333]">Target:</span> 
                          <span>Rp {formatRupiahCompact(item.target_amount)}</span>
                        </div>
                        <div>
                          <span className="inline-block w-[60px] font-semibold text-[#333]">Terkumpul:</span> 
                          <span>Rp {formatRupiahCompact(item.saved_amount)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] mt-3">
                        <span className="w-[60px]">Progress:</span>
                        <div className="flex-1 h-[10px] bg-black/10 rounded-[4px] overflow-hidden">
                          <div 
                            className="h-full bg-[#39dc31] rounded-[4px]" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-medium w-[24px]">{progress}%</span>
                      </div>
                      <div className="flex justify-between mt-3">
                        <button 
                          className="bg-transparent border-none text-[#333] text-[10px] cursor-pointer font-['Inter',_sans-serif] p-0 hover:underline" 
                          onClick={() => navigate('/wishlist')}
                        >
                          [ Detail ]
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
    </div>
  )
}