export default function Footer() {
  return (
    <footer className="pt-58 px-[10%] pb-[60px] bg-[#1d251f]">
      <div className="h-px bg-[#676464] mb-10"></div>
      <div className="flex flex-col gap-10">
        <div className="text-[#848484] text-[16px] leading-[1.6] max-w-[1000px]">
          <p className="m-0">
            <strong className="text-[#a0a0a0] font-bold">TabunganQu</strong> is an independent financial technology platform developed and operated
            independently. All third-party trademarks, logos, and brand names are
            the property of their respective owners and do not imply endorsement,
            sponsorship, or affiliation with TabunganQu unless explicitly stated.
          </p>
          <p className="m-0 mt-4">
            TabunganQu is <strong className="text-[#a0a0a0] font-bold">not a bank.</strong> It is a public web-based platform designed to help users manage personal
            finances with encrypted and secure data handling.
          </p>
        </div>
        
        <div className="flex flex-col-reverse items-center justify-between gap-5 text-center flex-wrap min-[993px]:flex-row min-[993px]:text-left">
          <div className="text-white font-bold text-[18px]">© 2026 TabunganQu Financial Technologies Inc.</div>
          <div className="flex gap-8">
            <a href="#" className="text-white font-bold text-[18px] no-underline transition-colors duration-200 hover:text-[#00682c]">Privacy Policy</a>
            <a href="#" className="text-white font-bold text-[18px] no-underline transition-colors duration-200 hover:text-[#00682c]">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  )
}