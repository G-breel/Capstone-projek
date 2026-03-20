import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="bg-[#1d251f] text-white font-['Inter',_sans-serif] min-h-screen overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex justify-between items-center py-5 px-5 md:py-6 md:px-16 bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,rgba(255,255,255,0.1)_100%),linear-gradient(to_left,#25390f,#25390f)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] relative z-10 animate-fade-in">
        <div className="font-['Inter',_sans-serif] text-[32px] text-white">TabunganQu</div>
        <div className="flex items-center gap-8">
          <button className="bg-transparent border-none text-white font-['Inter',_sans-serif] font-bold text-[16px] cursor-pointer" onClick={() => {}}>
            About Us
          </button>
          <button 
            className="bg-white/20 backdrop-blur-[10px] border border-white/30 rounded-lg py-2 px-8 text-white font-['Inter',_sans-serif] text-[16px] cursor-pointer transition-all duration-200 hover:bg-white/30" 
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-10 pt-10 pb-[80px] px-[10%] min-h-[70vh] bg-[#262d27] border-b-2 border-[#272c21] min-[993px]:flex-row min-[993px]:text-left min-[993px]:gap-0 min-[993px]:py-[80px] min-[993px]:justify-between">
          <div className="flex flex-col items-center flex-1 max-w-[600px] animate-slide-in-up min-[993px]:items-start">
            <h1 className="font-['Inter',_sans-serif] font-normal text-[32px] leading-[1.2] m-0 mb-6 md:text-[48px]">
              Kelola Tabunganmu.<br />
              Lebih Terkontrol.<br />
              Lebih Terarah.
            </h1>
            <p className="text-[16px] leading-[1.6] text-[#e2e8f0] m-0 mb-10 md:text-[18px]">
              Sistem pengelolaan tabungan yang membantu kamu mencatat setiap pemasukan dan
              pengeluaran dengan rapi, memantau progres target, dan membangun kebiasaan
              finansial yang lebih disiplin.
            </p>
            <div className="flex justify-center gap-5 min-[993px]:justify-start">
              <button 
                className="bg-[#00682c] text-white border-none py-[14px] px-7 rounded-lg text-[16px] cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,104,44,0.4)]" 
                onClick={() => navigate('/register')}
              >
                Mulai Sekarang
              </button>
              <button className="bg-[#d6d6d6] text-[#1d251f] border-none py-[14px] px-7 rounded-lg text-[16px] font-semibold cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#e2e2e2]">
                Pelajari lebih Lanjut
              </button>
            </div>
          </div>
          <div className="flex justify-center w-full flex-1 animate-fade-in [animation-delay:200ms] min-[993px]:justify-end min-[993px]:w-auto">
            <div className="flex items-center justify-center w-[400px] h-[300px] bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-white/50 text-[20px]">
              Gambar 1.1
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="flex flex-col-reverse items-center text-center gap-10 py-[100px] px-[10%] bg-[#1d251f] min-[993px]:flex-row min-[993px]:text-left min-[993px]:gap-[60px]">
          <div className="flex-1 w-full animate-fade-in">
            <div className="flex items-center justify-center w-full h-[350px] bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-white/50 text-[20px]">
              Gambar 1.2
            </div>
          </div>
          <div className="flex-1 animate-slide-in-right">
            <h2 className="font-['Inter',_sans-serif] font-normal text-[32px] leading-[1.3] m-0 mb-6 md:text-[40px]">
              Masih mencatat Tabungan Secara Manual?
            </h2>
            <p className="text-[16px] leading-[1.6] text-[#cccccc] m-0 md:text-[18px]">
              Tanpa pencatatan yang jelas, saldo sering tidak akurat, target tidak terpantau, dan uang terasa "hilang" tanpa jejak.<br/><br/>
              TabunganQu hadir sebagai solusi sederhana untuk memastikan setiap transaksi tercatat dan setiap tujuan finansial terukur.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-[100px] px-[10%] bg-[#2f3430] animate-fade-in">
          <h2 className="font-['Inter',_sans-serif] font-normal text-[32px] leading-[1.3] m-0 mb-12 text-center md:text-[40px]">
            Dirancang Dengan Kontrol Penuh<br/>Atas Tabungan Anda
          </h2>
          
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-10 text-center">
            {[
              { id: '2.1', title: 'Pencatat Transaksi\nTerstruktur', desc: 'Catat setiap setoran dan penarikan dengan sistem yang rapi dan mudah digunakan.' },
              { id: '2.2', title: 'Dashboard Ringkasan\nReal-Time', desc: 'Lihat saldo, total setoran, dan perkembangan target dalam satu tampilan yang jelas.' },
              { id: '2.3', title: 'Target Tabungan\nyang Terukur', desc: 'Tetapkan tujuan keuangan dan pantau progresnya secara visual.' },
              { id: '2.4', title: 'Riwayat Transaksi\nTransparan', desc: 'Semua aktivitas tercatat dan dapat ditinjau kapan saja.' },
            ].map((feature) => (
              <div key={feature.id} className="flex flex-col items-center">
                <div className="flex items-center justify-center w-full h-[160px] bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-white/50 text-[20px]">
                  Gambar {feature.id}
                </div>
                <h3 className="font-['Inter',_sans-serif] font-normal text-[22px] leading-[1.3] m-0 mt-5 mb-3 whitespace-pre-line">
                  {feature.title}
                </h3>
                <p className="text-[16px] leading-[1.5] text-[#cccccc] m-0">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* App Showcase Section */}
        <section className="flex justify-center py-[80px] px-[10%] bg-[#262d27] animate-fade-in">
          <div className="w-full max-w-[1000px]">
             <div className="flex items-center justify-center w-full h-[600px] bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-white/50 text-[24px]">
               Mockup Halaman Dashboard (image-50)
             </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full w-full bg-[#3e6945]/70 shadow-lg border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-6 py-8 md:px-10 relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/20 pb-5 mb-5 gap-4">
            <div className="text-[16px] md:text-[18px] font-bold text-white">
              © 2026 TabunganQu Financial Technologies Inc.
            </div>
            <div className="flex gap-6 text-[14px] md:text-[16px] font-bold text-white">
              <a href="#" className="hover:underline text-white/80 transition-colors no-underline">Privacy Policy</a>
              <a href="#" className="hover:underline text-white/80 transition-colors no-underline">Terms of Use</a>
            </div>
          </div>

          <p className="text-[#e3e3e3] text-[14px] leading-relaxed m-0 text-justify md:text-left">
            <span className="font-bold text-white">TabunganQu</span> is an independent financial technology platform developed and operated
            independently. All third-party trademarks, logos, and brand names are
            the property of their respective owners and do not imply endorsement,
            sponsorship, or affiliation with TabunganQu unless explicitly stated.
            <br /><br />
            TabunganQu is <span className="font-bold text-white">not a bank.</span> It is a public web-based platform designed to help users manage personal finances with encrypted and secure data handling.
          </p>

        </div>
      </footer>
    </div>
  )
}