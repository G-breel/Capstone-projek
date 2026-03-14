import { useAuth } from '../context/AuthContext'
import { getGreeting, formatRupiahCompact } from '../utils/helpers'
import { mockTransactions, mockWishlist, mockChartData } from '../utils/mockData'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/layout/Footer'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const totalPemasukan = mockTransactions.pemasukan.reduce((s, t) => s + t.amount, 0)
  const totalPengeluaran = mockTransactions.pengeluaran.reduce((s, t) => s + t.amount, 0)
  const totalSaldo = totalPemasukan - totalPengeluaran

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

  return (
    <div className="text-white pb-10 animate-fade-in">
      <h3 className="text-[28px] md:text-[32px] font-normal text-white m-0 mb-1">
          Hi, {user?.name || 'user'}
        </h3><br />
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
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
               </span>
           </div>
           <div className="relative z-[2] text-black text-[30px] font-['Inter',_sans-serif] font-semibold">
             {formatRupiahCompact(totalSaldo)}
           </div>
           <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(102,102,102,0.4)_0%,rgba(0,0,0,0.5)_100%),linear-gradient(to_left,#8cff00,#8cff00)] opacity-80 z-[1]"></div>
        </div>
        
        {/* Card Pengeluaran */}
        <div className="relative h-[150px] rounded-[20px] p-6 flex flex-col justify-center overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] bg-[#999]">
           <div className="relative z-[2] flex justify-between items-start mb-[10px]">
              <span className="text-black text-[20px] font-['Inter',_sans-serif] font-medium">Pengeluaran</span>
               <span className="text-[28px] opacity-80 text-black">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
               </span>
           </div>
           <div className="relative z-[2] text-black text-[30px] font-['Inter',_sans-serif] font-semibold">
             {formatRupiahCompact(totalPengeluaran)}
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
               <h3 className="font-['Inter',_sans-serif] text-[16px] font-medium text-white m-0">Pemasukan bulanan</h3>
               <select className="bg-[#8f8f8f] text-white border-none py-1 px-3 rounded-lg font-['Inter',_sans-serif] text-[14px] outline-none cursor-pointer" defaultValue="Feb">
                  <option value="Jan">Jan</option>
                  <option value="Feb">Feb</option>
                  <option value="Mar">Mar</option>
               </select>
            </div>
            <div className="w-full">
               <ResponsiveContainer width="100%" height={240}>
                 <BarChart data={mockChartData.pemasukan} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                   <XAxis dataKey="month" axisLine={true} tickLine={false} tick={{ fill: 'white', fontSize: 13, fontFamily: 'Inter' }} dy={10} />
                   <YAxis axisLine={true} tickLine={false} tick={{ fill: 'white', fontSize: 13, fontFamily: 'Inter' }} tickFormatter={v => v >= 1000000 ? `${v/1000000}jt` : `${v/1000}k`} />
                   <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                   <Bar dataKey="amount" fill="#d9d9d9" radius={[2, 2, 0, 0]} barSize={40} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          {/* Pengeluaran Chart */}
          <div className="bg-[#555555] bg-[linear-gradient(260deg,rgba(0,0,0,0.2)_60%,rgba(153,153,153,0.2)_100%)] rounded-[18px] p-6 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-['Inter',_sans-serif] text-[16px] font-medium text-white m-0">Pengeluaran bulanan</h3>
               <select className="bg-[#8f8f8f] text-white border-none py-1 px-3 rounded-lg font-['Inter',_sans-serif] text-[14px] outline-none cursor-pointer" defaultValue="Feb">
                  <option value="Jan">Jan</option>
                  <option value="Feb">Feb</option>
                  <option value="Mar">Mar</option>
               </select>
            </div>
            <div className="w-full">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={mockChartData.pengeluaran} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={true} tickLine={false} tick={{ fill: 'white', fontSize: 13, fontFamily: 'Inter' }} dy={10} />
                  <YAxis axisLine={true} tickLine={false} tick={{ fill: 'white', fontSize: 13, fontFamily: 'Inter' }} tickFormatter={v => v >= 1000000 ? `${v/1000000}jt` : `${v/1000}k`} />
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
              
              <div className="flex flex-col gap-4 overflow-y-auto pr-3 flex-1 
                [&::-webkit-scrollbar]:w-[6px] 
                [&::-webkit-scrollbar-track]:bg-white/10 [&::-webkit-scrollbar-track]:rounded-[10px] 
                [&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-thumb]:rounded-[10px] hover:[&::-webkit-scrollbar-thumb]:bg-white/50
                [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.4)_rgba(255,255,255,0.1)]"
              >
                 {mockWishlist.map(item => {
                    const progress = Math.min(100, Math.round((item.saved / item.target) * 100))
                    return (
                       <div key={item.id} className="bg-[#d9d9d9] rounded-[13px] p-4 text-black shrink-0">
                          <h4 className="text-[14px] font-semibold m-0 mb-[10px] font-['Inter',_sans-serif]">{item.name}</h4>
                          <div className="text-[11px] leading-[1.4] text-[#444]">
                             <div><span className="inline-block w-[60px] font-semibold text-[#333]">Target:</span> <span>{formatRupiahCompact(item.target)}</span></div>
                             <div><span className="inline-block w-[60px] font-semibold text-[#333]">Terkumpul:</span> <span>{formatRupiahCompact(item.saved)}</span></div>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] mt-3">
                             <span className="w-[60px]">Progress:</span>
                             <div className="flex-1 h-[10px] bg-black/10 rounded-[4px] overflow-hidden">
                                <div className="h-full bg-[#39dc31] rounded-[4px]" style={{ width: `${progress}%` }}></div>
                             </div>
                             <span className="text-[10px] font-medium w-[24px]">{progress}%</span>
                          </div>
                          <div className="flex justify-between mt-3">
                             <button className="bg-transparent border-none text-[#333] text-[10px] cursor-pointer font-['Inter',_sans-serif] p-0 hover:underline" onClick={() => navigate('/wishlist')}>[ Detail ]</button>
                          </div>
                       </div>
                    )
                 })}
              </div>
              
              
           </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}