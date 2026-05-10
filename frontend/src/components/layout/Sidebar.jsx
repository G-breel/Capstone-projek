import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { transactionService } from '../../services/transactionService'
import { formatRupiah, formatDate } from '../../utils/helpers'

const NAV_ITEMS = [
  { id: 'search', icon: 'search0.svg', label: 'Search' },
  { to: '/dashboard', label: 'Home/Dashboard' },
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/saldo', label: 'Saldo' },
  { to: '/report', label: 'Report' },
]

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Search state
  const [allTransactions, setAllTransactions] = useState([])
  const [hasFetched, setHasFetched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef(null)

  // Fetch transactions once when user starts typing
  useEffect(() => {
    if (searchQuery.trim().length > 0 && !hasFetched) {
      setIsLoading(true)
      setHasFetched(true) // Set immediately to prevent any re-triggering
      transactionService.getTransactions()
        .then(res => {
          setAllTransactions(res.data || [])
        })
        .catch(err => console.error('Gagal mengambil data transaksi untuk pencarian:', err))
        .finally(() => setIsLoading(false))
    }
  }, [searchQuery, hasFetched])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter transactions based on query
  const searchResults = allTransactions
    .filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5) // Tampilkan maksimal 5 hasil

  function handleSettingsClick() {
    navigate('/settings')
    onClose()
  }

  function handleLogoutClick() {
    logout()
    navigate('/')
    onClose()
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[89] min-[901px]:hidden" 
          onClick={onClose} 
        />
      )}

      <aside 
        className={`fixed top-0 left-0 h-screen w-[280px] flex-shrink-0 flex flex-col z-[90] overflow-hidden border-r border-black/50 transition-transform duration-300 shadow-[10px_0_30px_rgba(0,0,0,0.5)] min-[901px]:relative min-[901px]:translate-x-0 min-[901px]:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-0 z-[1] backdrop-blur-[2.5px] bg-[linear-gradient(90deg,rgba(140,255,0,0.15)_0%,rgba(0,0,0,0.2)_35%),linear-gradient(to_left,#101010,#101010)]"></div>
        
        <div className="relative z-[2] flex flex-col h-full py-[30px]">
          <div 
            className="text-white text-center font-['Inter',_sans-serif] text-[32px] font-bold mb-10 px-5 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            TabunganQU
          </div>
          
          <nav className="flex flex-col gap-5 flex-1 px-[30px]">
            <div className="flex justify-between items-center pb-4 mb-2 border-b border-white/10 min-[901px]:hidden">
              <span className="font-['Inter',_sans-serif] font-semibold text-[16px] text-white">Menu</span>
              <button className="bg-transparent border-none text-[18px] text-white px-2 py-1 cursor-pointer" onClick={onClose}>✕</button>
            </div>

            {NAV_ITEMS.map(item => {
              if (item.id === 'search') {
                return (
                  <div key="search" className="relative mb-5" ref={searchRef}>
                    <form 
                      className="flex items-center gap-3 px-4 py-2.5 bg-[#c1d3c1] rounded-[100px] text-black relative z-10"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <div className="text-[14px]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </div>
                      <input 
                        type="text"
                        placeholder="Cari transaksi..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setShowDropdown(true)
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className="w-full bg-transparent border-none text-black font-['Inter',_sans-serif] text-[14px] outline-none placeholder:text-black/60"
                      />
                    </form>
                    
                    {/* Search Dropdown */}
                    {showDropdown && searchQuery.trim().length > 0 && (
                      <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#2A2A2A] rounded-xl shadow-xl border border-white/10 overflow-hidden z-20 flex flex-col max-h-[300px] overflow-y-auto">
                        {isLoading ? (
                          <div className="px-4 py-3 text-[13px] text-white/50 text-center">Memuat...</div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map(trans => (
                            <div 
                              key={trans.id} 
                              className="px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                              onClick={() => {
                                navigate('/saldo')
                                setShowDropdown(false)
                                setSearchQuery('')
                                onClose()
                              }}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[11px] text-white/50">{formatDate(trans.transaction_date)}</span>
                                <span className={`text-[13px] font-mono font-bold ${trans.type === 'pemasukan' ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {trans.type === 'pemasukan' ? '+' : '-'} Rp {formatRupiah(trans.amount)}
                                </span>
                              </div>
                              <p className="text-[13px] text-white/90 line-clamp-1">{trans.description}</p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-[13px] text-white/50 text-center">Tidak ada hasil</div>
                        )}
                      </div>
                    )}
                  </div>
                )
              }

              const isActive = location.pathname === item.to || (item.label==='Home' && location.pathname==='/')
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`relative flex items-center py-2 font-['Inter',_sans-serif] text-[16px] no-underline transition-all duration-200 hover:text-white hover:translate-x-1 ${
                    isActive ? 'text-white font-bold' : 'text-white/70 font-normal'
                  }`}
                  onClick={onClose}
                >
                  <span className="">{item.label}</span>
                  {isActive && <div className="" />}
                </NavLink>
              )
            })}
          </nav>

          <div className="flex flex-col gap-5 px-[30px] mt-auto">
             <div className="flex items-center gap-[6px] text-white font-['Inter',_sans-serif] text-[16px] cursor-pointer transition-opacity duration-200 hover:opacity-80" onClick={handleSettingsClick}>
               <span>Settings & </span>
               <span className="italic">More</span>
               <div className="text-[24px] ml-2.5">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                 </svg>
               </div>
             </div>
             
             <button className="self-start bg-red-500/10 border border-red-500/30 text-[#ff4d4f] px-4 py-2 rounded-md font-['Inter',_sans-serif] cursor-pointer transition-colors duration-200 hover:bg-red-500/20" onClick={handleLogoutClick}>Logout</button>
          </div>
        </div>
      </aside>
    </>
  )
}