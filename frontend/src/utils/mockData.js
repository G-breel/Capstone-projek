/**
 * Data Dummy
 */

export const mockTransactions = {
  pemasukan: [
    { id: 1, date: '2026-03-07', amount: 300000, description: 'Gaji bulanan' },
    { id: 2, date: '2026-03-05', amount: 300000, description: 'Bonus proyek' },
    { id: 3, date: '2026-03-01', amount: 150000, description: 'Freelance' },
    { id: 4, date: '2026-02-28', amount: 500000, description: 'Gaji bulanan' },
    { id: 5, date: '2026-02-15', amount: 250000, description: 'Hadiah' },
    { id: 6, date: '2026-01-31', amount: 500000, description: 'Gaji bulanan' },
    { id: 7, date: '2026-01-20', amount: 100000, description: 'Cashback' },
  ],
  pengeluaran: [
    { id: 8, date: '2026-03-06', amount: 50000, description: 'Makan siang' },
    { id: 9, date: '2026-03-03', amount: 100000, description: 'Transport' },
    { id: 10, date: '2026-02-25', amount: 75000, description: 'Pulsa & internet' },
    { id: 11, date: '2026-02-10', amount: 200000, description: 'Belanja bulanan' },
    { id: 12, date: '2026-01-28', amount: 150000, description: 'Makan' },
    { id: 13, date: '2026-01-15', amount: 100000, description: 'Transport' },
  ],
}

export const mockWishlist = [
  { id: 1, name: 'Beli Laptop', icon: '💻', target: 20000000, saved: 8000000 },
  { id: 2, name: 'Dana Darurat', icon: '🛡️', target: 5000000, saved: 1500000 },
  { id: 3, name: 'Beli PS5', icon: '🎮', target: 7000000, saved: 700000 },
  { id: 4, name: 'Liburan Bali', icon: '✈️', target: 8000000, saved: 2000000 },
  { id: 5, name: 'iPhone Baru', icon: '📱', target: 15000000, saved: 5000000 },
]

export const mockChartData = {
  pemasukan: [
    { month: 'Jan', amount: 600000 },
    { month: 'Feb', amount: 750000 },
    { month: 'Mar', amount: 650000 },
  ],
  pengeluaran: [
    { month: 'Jan', amount: 250000 },
    { month: 'Feb', amount: 275000 },
    { month: 'Mar', amount: 150000 },
  ],
}
