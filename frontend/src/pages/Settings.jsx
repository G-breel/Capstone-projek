import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Footer from '../components/layout/Footer'

const Icon = ({ name, size = 16, className = '' }) => {
  switch (name) {
    case 'user-large': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
    case 'lock': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
    case 'trash': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
    case 'warning': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
    default: return null;
  }
}

export default function Settings() {
  const { user, updateProfile, deleteAccount, logout } = useAuth()
  const toast = useToast()

  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  function handleDeleteAccount() {
    deleteAccount()
    toast.success('Akun Anda telah dihapus secara permanen 🗑️')
  }

  function handleProfileSave(e) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Nama tidak boleh kosong'); return }
    updateProfile({ name: name.trim() })
    toast.success('Profil berhasil diperbarui ✅')
  }

  function handlePasswordChange(e) {
    e.preventDefault()
    if (!oldPw || !newPw) { toast.error('Semua field password harus diisi'); return }
    if (newPw.length < 6) { toast.error('Password baru minimal 6 karakter'); return }
    toast.success('Password berhasil diubah 🔐')
    setOldPw('')
    setNewPw('')
  }

  return (
    <div className="text-white pb-10 animate-fade-in font-['Inter',_sans-serif]">
      <h2 className="text-[24px] font-normal mb-10">Profile Anda</h2>

      {/* Center Avatar Section */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-[100px] h-[100px] bg-[#c1d3c1] rounded-full flex items-center justify-center shadow-[0_0_0_6px_rgba(255,255,255,0.1)] mb-4">
          <Icon name="user-large" size={48} className="text-white" />
        </div>
        <h3 className="text-[32px] font-normal text-white text-center m-0">
          {user?.name || 'Nama Pengguna'}
        </h3>
      </div>

      <div className="max-w-[700px] mx-auto flex flex-col gap-8">
        
        {/* Profile Settings Panel */}
        <div className="bg-[#555555] bg-[linear-gradient(260deg,rgba(0,0,0,0.2)_60%,rgba(153,153,153,0.2)_100%)] rounded-[18px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-white/5">
          <form onSubmit={handleProfileSave} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-white font-normal text-[14px]">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="bg-[#666666] border-none rounded-lg py-3.5 px-4 text-white font-['Inter',_sans-serif] text-[15px] outline-none focus:ring-1 focus:ring-white/30 transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white font-normal text-[14px]">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-[#666666]/50 border-none rounded-lg py-3.5 pl-4 pr-10 text-white/50 font-['Inter',_sans-serif] text-[15px] outline-none cursor-not-allowed"
                />
                <Icon name="lock" size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button type="submit" className="bg-[#5bc55f] text-white border-none rounded-[20px] py-2 px-8 font-['Inter',_sans-serif] text-[14px] cursor-pointer transition-opacity duration-200 hover:opacity-90">
                Simpan
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings Panel */}
        <div className="bg-[#555555] bg-[linear-gradient(260deg,rgba(0,0,0,0.2)_60%,rgba(153,153,153,0.2)_100%)] rounded-[18px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-white/5">
          <h4 className="text-[18px] font-medium text-white mb-6 m-0 flex items-center gap-2">
            <Icon name="lock" size={18} /> Keamanan
          </h4>
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-white font-normal text-[14px]">Password Lama</label>
              <input
                type="password"
                value={oldPw}
                onChange={e => setOldPw(e.target.value)}
                placeholder="Masukkan password lama"
                required
                className="bg-[#666666] border-none rounded-lg py-3.5 px-4 text-white font-['Inter',_sans-serif] text-[15px] outline-none focus:ring-1 focus:ring-white/30 transition-all placeholder:text-white/40"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white font-normal text-[14px]">Password Baru</label>
              <input
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                className="bg-[#666666] border-none rounded-lg py-3.5 px-4 text-white font-['Inter',_sans-serif] text-[15px] outline-none focus:ring-1 focus:ring-white/30 transition-all placeholder:text-white/40"
              />
            </div>
            <div className="flex justify-end mt-2">
              <button type="submit" className="bg-white/10 border border-white/20 text-white rounded-[20px] py-2 px-6 font-['Inter',_sans-serif] text-[14px] cursor-pointer transition-colors duration-200 hover:bg-white/20">
                Ubah Password
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone Panel */}
        <div className="bg-[#3a1c1c] bg-[linear-gradient(260deg,rgba(0,0,0,0.2)_60%,rgba(200,50,50,0.1)_100%)] rounded-[18px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-red-500/20">
          <h4 className="text-[18px] font-medium text-[#ff6b6b] mb-3 m-0 flex items-center gap-2">
            <Icon name="warning" size={18} /> Zona Berbahaya
          </h4>
          <p className="text-[14px] text-white/70 leading-relaxed mb-6">
            Sekali Anda menghapus akun, semua data riwayat transaksi dan wishlist akan hilang secara permanen dan tidak dapat dikembalikan.
          </p>

          {!showDeleteConfirm ? (
            <button 
              className="bg-transparent border border-[#ff6b6b] text-[#ff6b6b] rounded-lg py-3 px-6 font-['Inter',_sans-serif] text-[14px] font-medium cursor-pointer transition-colors duration-200 hover:bg-[#ff6b6b] hover:text-white flex items-center gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Icon name="trash" size={16} /> Hapus Akun Saya
            </button>
          ) : (
            <div className="bg-black/30 border border-red-500/30 rounded-xl p-5 animate-scale-in">
              <p className="text-white font-medium text-[15px] mb-4 m-0">Apakah Anda yakin ingin menghapus akun permanen?</p>
              <div className="flex gap-3">
                <button 
                  className="bg-white/10 border-none text-white rounded-lg py-2.5 px-5 font-['Inter',_sans-serif] text-[13px] cursor-pointer transition-colors hover:bg-white/20"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Batal
                </button>
                <button 
                  className="bg-[#ff4747] border-none text-white rounded-lg py-2.5 px-5 font-['Inter',_sans-serif] text-[13px] font-medium cursor-pointer transition-colors hover:bg-[#ff2424]"
                  onClick={handleDeleteAccount}
                >
                  Ya, Hapus Permanen!
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  )
}