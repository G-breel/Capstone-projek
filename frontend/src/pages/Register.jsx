import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!name || !email || !password) {
      toast.error('Semua field harus diisi')
      return
    }
    
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    if (!captchaChecked) {
      toast.error('Tolong centang "I\'m not a robot" terlebih dahulu')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await register(name, email, password)
      
      if (result.success) {
        toast.success('Akun berhasil dibuat! 🎉')
        navigate('/dashboard', { replace: true })
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleGoogleLogin() {
    toast.error('Daftar dengan Google belum tersedia saat ini 🚧')
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#101010] overflow-hidden font-['Inter',_sans-serif]">
      
      {/* Background and Overlays */}
      <div className="absolute inset-0 bg-[#1a221f] flex items-center justify-center z-[1]">
        <div className="text-white/20 text-[24px] border-2 border-dashed border-white/20 py-5 px-10 rounded-xl">
          Background Image Placeholder (image-bg0.png)
        </div>
      </div>
      
      <div className="absolute inset-0 z-[2] backdrop-blur-[2px] bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,rgba(140,255,0,0.1)_100%),linear-gradient(to_left,rgba(16,16,16,0.8),rgba(16,16,16,0.8))]"></div>
      <div className="absolute inset-0 z-[3] bg-[radial-gradient(closest-side,rgba(255,255,255,0.1)_10%,rgba(255,255,255,0)_100%)]"></div>
      
      {/* Container */}
      <div className="relative z-10 w-full max-w-[90%] min-[577px]:max-w-[420px] bg-[#525050]/60 rounded-2xl py-[30px] px-6 min-[577px]:py-10 min-[577px]:px-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-[10px] border border-white/10 animate-scale-in">
        
        {/* TAMBAHKAN TOMBOL CLOSE / BACK */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          title="Kembali ke Beranda"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Logo yang bisa diklik */}
        <h1 
          className="font-bold text-[40px] min-[577px]:text-[48px] text-white text-center m-0 mb-2.5 leading-none cursor-pointer hover:text-emerald-400 transition-colors font-['Inter',_sans-serif]" 
          onClick={() => navigate('/')}
        >
          TabunganQu
        </h1>

        <p className="text-white text-[13px] text-left mb-[30px] opacity-90">
          Mulai perjalanan menuju finansial teratur.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Nama lengkap"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-transparent border-none text-white text-[16px] py-2 outline-none placeholder:text-white/50"
            />
            <div className="h-px bg-white/60 w-full mt-1"></div>
          </div>

          <div className="relative w-full mt-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border-none text-white text-[16px] py-2 outline-none placeholder:text-white/50"
            />
            <div className="h-px bg-white/60 w-full mt-1"></div>
          </div>
          
          <div className="relative w-full mt-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border-none text-white text-[16px] py-2 outline-none placeholder:text-white/50"
            />
            <div className="h-px bg-white/60 w-full mt-1"></div>
          </div>

          {/* reCAPTCHA */}
          <div 
            className="mt-6 bg-[#f9f9f9] border border-[#d3d3d3] rounded-[3px] py-2.5 px-3 w-full flex justify-between items-center cursor-pointer select-none transition-colors hover:bg-[#f1f1f1]"
            onClick={() => setCaptchaChecked(!captchaChecked)}
          >
            <div className="flex items-center gap-3 text-[#333] text-[13px] font-['Inter',_sans-serif]">
              <div className="flex items-center justify-center w-[26px] h-[26px] border-2 border-[#c1c1c1] rounded-sm bg-white overflow-hidden transition-all duration-200">
                {captchaChecked && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#009E55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-[scaleIn_0.2s_ease-out]">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span>I'm not a robot</span>
            </div>
            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="h-[30px] ml-auto" />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 bg-[#28a745] text-white border-none p-3 text-[16px] font-medium rounded cursor-pointer transition-colors duration-200 hover:bg-[#218838] disabled:opacity-50 disabled:cursor-not-allowed font-['Inter',_sans-serif]"
          >
            {isLoading ? 'Loading...' : 'Daftar'}
          </button>
        </form>

        <button 
          type="button" 
          className="mt-4 w-full bg-[#e0e0e0] text-[#333] border-none p-3 text-[16px] font-medium rounded cursor-pointer flex items-center justify-center gap-2.5 transition-colors duration-200 hover:bg-[#d0d0d0] font-['Inter',_sans-serif]" 
          onClick={handleGoogleLogin}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        {/* Link ke Login dan Home */}
        <div className="flex justify-between items-center mt-8 text-white text-[14px] font-['Inter',_sans-serif]">
          <Link to="/login" className="text-[#00b2ff] no-underline hover:underline">
            Sudah punya akun? Login
          </Link>
          
          <Link to="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  )
}