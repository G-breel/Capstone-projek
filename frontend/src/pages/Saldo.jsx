import { useState, useMemo } from 'react'
import { mockTransactions } from '../utils/mockData'
import { formatRupiahCompact, formatRupiah, formatDate, getMonthName, getTodayISO } from '../utils/helpers'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import Footer from '../components/layout/Footer'

// Custom SVGs
const Icon = ({ name, size = 16, className = '' }) => {
  switch (name) {
    case 'edit': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
    case 'trash': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
    case 'plus-circle': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
    case 'money': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
    case 'trending-down': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>;
    case 'save': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
    case 'x': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
    case 'empty-wallet': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
    case 'empty-cart': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;
    case 'calendar': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
    default: return null;
  }
}

export default function Saldo() {
  const toast = useToast()

  const [pemasukan, setPemasukan] = useState(mockTransactions.pemasukan)
  const [pengeluaran, setPengeluaran] = useState(mockTransactions.pengeluaran)

  const now = new Date()
  const [pemasukanMonth, setPemasukanMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  const [pengeluaranMonth, setPengeluaranMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('pemasukan') 
  const [editItem, setEditItem] = useState(null)
  const [formDate, setFormDate] = useState(getTodayISO())
  const [formAmount, setFormAmount] = useState('')
  const [formDesc, setFormDesc] = useState('')

  const totalPemasukan = pemasukan.reduce((s, t) => s + t.amount, 0)
  const totalPengeluaran = pengeluaran.reduce((s, t) => s + t.amount, 0)
  const totalSaldo = totalPemasukan - totalPengeluaran

  function filterByMonth(list, monthStr) {
    return list.filter(item => item.date.startsWith(monthStr))
  }

  const filteredPemasukan = useMemo(() => filterByMonth(pemasukan, pemasukanMonth), [pemasukan, pemasukanMonth])
  const filteredPengeluaran = useMemo(() => filterByMonth(pengeluaran, pengeluaranMonth), [pengeluaran, pengeluaranMonth])

  function getMonthOptions() {
    const opts = []
    for (let y = 2026; y >= 2025; y--) {
      for (let m = 11; m >= 0; m--) {
        opts.push({
          value: `${y}-${String(m + 1).padStart(2, '0')}`,
          label: `${getMonthName(m).substring(0,3)}`,
        })
      }
    }
    return opts
  }
  const monthOptions = getMonthOptions()

  function openAdd(type) {
    setModalType(type)
    setEditItem(null)
    setFormDate(getTodayISO())
    setFormAmount('')
    setFormDesc('')
    setModalOpen(true)
  }

  function openEdit(type, item) {
    setModalType(type)
    setEditItem(item)
    setFormDate(item.date)
    setFormAmount(String(item.amount))
    setFormDesc(item.description)
    setModalOpen(true)
  }

  function handleSave(e) {
    e.preventDefault()
    const amount = parseInt(formAmount)
    if (!amount || amount <= 0) { toast.error('Nominal harus lebih dari 0'); return }
    if (!formDesc.trim()) { toast.error('Keterangan harus diisi'); return }

    if (modalType === 'pengeluaran' && !editItem && amount > totalSaldo) {
      toast.error('Saldo tidak cukup untuk ditarik!')
      return
    }

    const entry = { id: editItem?.id || Date.now(), date: formDate, amount, description: formDesc.trim() }

    if (modalType === 'pemasukan') {
      if (editItem) {
        setPemasukan(prev => prev.map(p => p.id === editItem.id ? entry : p))
        toast.success('Pemasukan berhasil diubah')
      } else {
        setPemasukan(prev => [entry, ...prev])
        toast.success(`Pemasukan berhasil ditambahkan!`)
      }
    } else {
      if (editItem) {
        setPengeluaran(prev => prev.map(p => p.id === editItem.id ? entry : p))
        toast.success('Pengeluaran berhasil diubah')
      } else {
        setPengeluaran(prev => [entry, ...prev])
        toast.success(`Pengeluaran berhasil dicatat`)
      }
    }
    setModalOpen(false)
  }

  function handleDelete(type, id) {
    if (type === 'pemasukan') {
      setPemasukan(prev => prev.filter(p => p.id !== id))
    } else {
      setPengeluaran(prev => prev.filter(p => p.id !== id))
    }
    toast.success('Data berhasil dihapus')
  }

  function renderTable(data, type, selectedMonth, setMonth) {
    const thClass = "border border-white/40 py-3 px-5 text-center text-[14px] font-medium font-['Inter',_sans-serif] first:border-l-0 last:border-r-0"
    const tdClass = "border border-white/40 py-3 px-5 text-center text-[14px] font-['Inter',_sans-serif] first:border-l-0 last:border-r-0"

    return (
      <div className="bg-[#676464] bg-[linear-gradient(260.6deg,rgba(0,0,0,0.2)_63.4%,rgba(153,153,153,0.2)_100%)] rounded-[18px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden mt-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4 px-2.5">
          <h3 className="font-['Inter',_sans-serif] text-[18px] font-medium text-white m-0 lowercase">
            {type === 'pemasukan' ? 'pemasukan' : 'pengeluaran'}
          </h3>
          <div className="flex items-center gap-3">
            <button 
              className="bg-[#e0e0e0] text-[#333] border-none w-[26px] h-[26px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-white" 
              onClick={() => openAdd(type)} 
              title="Tambah Data"
            >
               <Icon name="plus-circle" size={16} />
            </button>
            <div className="relative">
               <select
                 className="appearance-none bg-[#8f8f8f] text-white border-none py-1 pr-[34px] pl-3.5 rounded-[100px] font-['Inter',_sans-serif] text-[14px] outline-none cursor-pointer"
                 value={selectedMonth}
                 onChange={e => setMonth(e.target.value)}
               >
                 {monthOptions.map(o => (
                   <option key={o.value} value={o.value}>{o.label}</option>
                 ))}
               </select>

               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white pointer-events-none">▼</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-2.5 rounded-lg">
          {data.length === 0 ? (
            <div className="text-center p-10 text-white/50 text-[14px] font-['Inter',_sans-serif]">
              <Icon name={type === 'pemasukan' ? 'empty-wallet' : 'empty-cart'} size={48} className="mb-4 mx-auto" />
              <br />
              Belum ada {type} bulan ini
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-t border-white/40">
                  <th className={thClass}>H/B/T</th>
                  <th className={thClass}>Saldo</th>
                  <th className={thClass}>keterangan</th>
                  <th className={thClass} style={{width: '60px'}}></th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id}>
                    <td className={tdClass}>{formatDate(item.date)}</td>
                    <td className={tdClass}>{formatRupiahCompact(item.amount)}</td>
                    <td className={`${tdClass} !text-left !pl-[30px]`}>{item.description}</td>
                    <td className={tdClass}>
                      <div className="flex justify-center gap-3">
                         <button className="bg-transparent border-none text-white/70 cursor-pointer p-1 transition-colors duration-200 hover:text-white" onClick={() => openEdit(type, item)} title="Edit"><Icon name="edit" size={14} /></button>
                         <button className="bg-transparent border-none text-white/70 cursor-pointer p-1 transition-colors duration-200 hover:text-white" onClick={() => handleDelete(type, item.id)} title="Hapus"><Icon name="trash" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="text-white pb-10 animate-fade-in">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        
        {/* Card Dana Offline */}
        <div className="relative h-[150px] rounded-[20px] py-6 px-[30px] flex flex-col justify-center overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] bg-[#739d34]">
           <div className="relative z-[2] flex justify-between items-start mb-[10px]">
              <span className="text-black text-[20px] font-['Inter',_sans-serif] font-medium">Dana Offline</span>
              <span className="opacity-80 text-black"><Icon name="money" size={28} /></span>
           </div>
           <div className="relative z-[2] text-black text-[30px] font-['Inter',_sans-serif] font-semibold">{formatRupiahCompact(totalSaldo)}</div>
           <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(102,102,102,0.4)_0%,rgba(0,0,0,0.5)_100%),linear-gradient(to_left,#8cff00,#8cff00)] opacity-80 z-[1]"></div>
        </div>
        
        {/* Card Pengeluaran */}
        <div className="relative h-[150px] rounded-[20px] py-6 px-[30px] flex flex-col justify-center overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] bg-[#999]">
           <div className="relative z-[2] flex justify-between items-start mb-[10px]">
              <span className="text-black text-[20px] font-['Inter',_sans-serif] font-medium">Pengeluaran</span>
              <span className="opacity-80 text-black"><Icon name="trending-down" size={28} /></span>
           </div>
           <div className="relative z-[2] text-black text-[30px] font-['Inter',_sans-serif] font-semibold">{formatRupiahCompact(totalPengeluaran)}</div>
           <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(102,102,102,0.4)_0%,rgba(0,0,0,0.5)_100%),linear-gradient(to_left,#ffffff,#ffffff)] opacity-80 z-[1]"></div>
        </div>
      </div>

      {renderTable(filteredPemasukan, 'pemasukan', pemasukanMonth, setPemasukanMonth)}
      {renderTable(filteredPengeluaran, 'pengeluaran', pengeluaranMonth, setPengeluaranMonth)}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editItem ? 'Edit' : 'Tambah'} ${modalType === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}`}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="font-['Inter',_sans-serif] text-[16px] font-medium text-white mb-5">
             Tambah {modalType} offline kamu
          </div>
          
          <div className="mb-3">
             <div className="flex items-center border-b border-white pb-1 w-max min-w-[200px]">
                <span className="flex items-center gap-2 text-white font-['Inter',_sans-serif] text-[16px] mr-3">H/B/T <Icon name="calendar" size={18} /></span>
                <input 
                  type="date" 
                  className="bg-transparent border-none text-white font-['Inter',_sans-serif] text-[16px] outline-none [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                  value={formDate} 
                  onChange={e => setFormDate(e.target.value)} 
                  required 
                />
             </div>
          </div>
          
          <div className="mb-3">
             <div className="flex items-center border-b border-white pb-1 w-max min-w-[200px]">
                <span className="flex items-center gap-2 text-white font-['Inter',_sans-serif] text-[16px] mr-3">Rp</span>
                <input 
                  type="number" 
                  className="bg-transparent border-none text-white font-['Inter',_sans-serif] text-[16px] outline-none" 
                  value={formAmount} 
                  onChange={e => setFormAmount(e.target.value)} 
                  min="1" 
                  required 
                />
             </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-6">
            <label className="text-white font-['Inter',_sans-serif] text-[16px]">Keterangan</label>
            <textarea 
              className="bg-[#d9d9d9]/40 border border-white/10 rounded-xl py-3 px-4 text-white font-['Inter',_sans-serif] text-[14px] resize-y outline-none placeholder:text-white/60 focus:border-white/30" 
              value={formDesc} 
              onChange={e => setFormDesc(e.target.value)} 
              placeholder="Contoh: Baru gajian" 
              required 
              rows="3"
            ></textarea>
          </div>
          
          <div className="flex justify-end mt-6">
             <button type="submit" className="bg-[linear-gradient(85.95deg,#319f43_17%,#62bd71_69%)] rounded-[20px] border-none text-white py-2 px-6 font-['Inter',_sans-serif] text-[16px] cursor-pointer transition-opacity duration-200 hover:opacity-90">
               Simpan
             </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  )
}