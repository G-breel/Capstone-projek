import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { transactionService } from '../services/transactionService'
import { wishlistService } from '../services/wishlistService'
import { DEBUG_MODE } from '../config/debugMode'
import { DUMMY_SUMMARY, DUMMY_PEMASUKAN, DUMMY_PENGELUARAN, DUMMY_WISHLIST } from '../data/dummyData'
import { formatRupiah, formatDate, getTodayISO } from '../utils/helpers'
import Modal from '../components/ui/Modal'
import Footer from '../components/layout/Footer'
import LoadingSpinner from '../components/ui/LoadingSpinner'

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

function buildRunningBalanceMap(transactions) {
  const sorted = [...transactions].sort((a, b) => {
    const da = new Date(a.transaction_date).getTime()
    const db = new Date(b.transaction_date).getTime()
    if (da !== db) return da - db
    return (a.id ?? 0) - (b.id ?? 0)
  })
  let bal = 0
  const map = new Map()
  for (const t of sorted) {
    if (t.type === 'pemasukan') bal += t.amount
    else bal -= t.amount
    map.set(t.id, bal)
  }
  return map
}

const getMonthFilterOptions = () => {
  const options = [{ value: '', label: 'Semua bulan' }]
  for (let i = 0; i < 12; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const value = `${year}-${month}`
    const label = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date)
    options.push({ value, label })
  }
  return options
}

const paginateData = (data, page, rowsPerPageValue) => {
  const start = (page - 1) * rowsPerPageValue
  return data.slice(start, start + rowsPerPageValue)
}

export default function Histori() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [allTransactions, setAllTransactions] = useState([])
  const [summary, setSummary] = useState({ saldo: 0, pemasukan: 0, pengeluaran: 0 })
  const [wishlists, setWishlists] = useState([])

  const [filterMonth, setFilterMonth] = useState('')
  const [filterType, setFilterType] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('pemasukan')
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    date: getTodayISO(),
    amount: '',
    description: '',
    wishlistId: ''
  })
  const [amountDisplay, setAmountDisplay] = useState('')

  useEffect(() => {
    const q = searchParams.get('search')
    if (q) setSearch(q)
  }, [searchParams])

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [filterMonth, filterType, search])

  const balanceMap = useMemo(() => buildRunningBalanceMap(allTransactions), [allTransactions])

  const displayedRows = useMemo(() => {
    let rows = [...allTransactions]
    if (filterMonth) {
      rows = rows.filter((t) => t.transaction_date && t.transaction_date.startsWith(filterMonth))
    }
    if (filterType) {
      rows = rows.filter((t) => t.type === filterType)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter((t) => t.description.toLowerCase().includes(q))
    }
    rows.sort((a, b) => {
      const da = new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      if (da !== 0) return da
      return (b.id ?? 0) - (a.id ?? 0)
    })
    return rows
  }, [allTransactions, filterMonth, filterType, search])

  const paginatedRows = useMemo(
    () => paginateData(displayedRows, page, rowsPerPage),
    [displayedRows, page, rowsPerPage]
  )

  const totalPages = Math.max(1, Math.ceil(displayedRows.length / rowsPerPage))

  const fetchAllData = async () => {
    setLoading(true)
    if (DEBUG_MODE.ENABLED) {
      setTimeout(() => {
        setSummary(DUMMY_SUMMARY)
        setAllTransactions([...DUMMY_PEMASUKAN, ...DUMMY_PENGELUARAN])
        setWishlists(DUMMY_WISHLIST)
        setLoading(false)
      }, 400)
      return
    }
    try {
      const [summaryRes, transRes, wishRes] = await Promise.all([
        transactionService.getSummary(),
        transactionService.getTransactions({}),
        wishlistService.getWishlists()
      ])
      setSummary(summaryRes.data)
      setAllTransactions(transRes.data || [])
      setWishlists(wishRes.data || [])
    } catch {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlists = async () => {
    try {
      const res = await wishlistService.getWishlists()
      setWishlists(res.data || [])
    } catch {
      /* noop */
    }
  }

  const openAddModal = (type) => {
    setModalType(type)
    setEditItem(null)
    setFormData({ date: getTodayISO(), amount: '', description: '', wishlistId: '' })
    setAmountDisplay('')
    setModalOpen(true)
  }

  const openEditModal = (item) => {
    setModalType(item.type)
    setEditItem(item)
    setFormData({
      date: item.transaction_date,
      amount: item.amount.toString(),
      description: item.description,
      wishlistId: ''
    })
    setAmountDisplay(formatRupiahInput(item.amount.toString()))
    setModalOpen(true)
  }

  const handleAmountChange = (e) => {
    const formatted = formatRupiahInput(e.target.value)
    const numericValue = parseRupiahToNumber(formatted)
    setAmountDisplay(formatted)
    setFormData({ ...formData, amount: numericValue.toString() })
  }

  const updateWishlistManually = async (wishlistId, amount) => {
    const wishlist = wishlists.find((w) => w.id === parseInt(wishlistId, 10))
    if (!wishlist) return null
    const newSaved = wishlist.saved_amount + amount
    await wishlistService.updateWishlist(wishlistId, {
      name: wishlist.name,
      targetAmount: wishlist.target_amount,
      savedAmount: newSaved
    })
    return { name: wishlist.name, oldAmount: wishlist.saved_amount, newAmount: newSaved }
  }

  const handleSubmit = async (e) => {
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
    if (modalType === 'pengeluaran' && !editItem && amount > summary.saldo) {
      toast.error('Saldo tidak cukup!')
      return
    }

    setLoading(true)
    try {
      const data = {
        type: modalType,
        amount,
        description: formData.description.trim(),
        transactionDate: formData.date
      }
      if (editItem) {
        await transactionService.updateTransaction(editItem.id, data)
        toast.success(`${modalType} berhasil diupdate`)
      } else {
        await transactionService.createTransaction(data)
        toast.success(`${modalType} berhasil ditambahkan`)
        if (formData.wishlistId) {
          try {
            const result = await updateWishlistManually(formData.wishlistId, amount)
            if (result) {
              toast.success(
                `Tabungan "${result.name}": Rp ${formatRupiah(result.oldAmount)} → Rp ${formatRupiah(result.newAmount)}`
              )
            }
          } catch {
            toast.error('Gagal update wishlist, transaksi tetap tersimpan')
          }
        }
      }
      setModalOpen(false)
      await fetchAllData()
      await fetchWishlists()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus transaksi ini?')) return
    setLoading(true)
    try {
      await transactionService.deleteTransaction(id)
      toast.success('Transaksi berhasil dihapus')
      await fetchAllData()
    } catch {
      toast.error('Gagal menghapus transaksi')
    } finally {
      setLoading(false)
    }
  }

  const clearSearchParam = () => {
    setSearchParams({})
  }

  if (loading && !modalOpen) {
    return <LoadingSpinner />
  }

  return (
    <div className="animate-fade-in p-4 text-white min-[901px]:p-6">
      <p className="mb-4 text-[14px] text-white/55">
        Riwayat lengkap pemasukan & pengeluaran, saldo berjalan, dan cuplikan wishlist.
      </p>

      {/* Ringkasan saldo */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-800 p-6 shadow-[0_12px_40px_rgba(16,185,129,0.22)] ring-1 ring-white/10">
          <p className="text-sm text-emerald-50/90">Total Saldo</p>
          <p className="text-2xl font-bold tracking-tight">Rp {formatRupiah(summary.saldo)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-900 p-6 shadow-[0_12px_40px_rgba(59,130,246,0.2)] ring-1 ring-white/10">
          <p className="text-sm text-blue-50/90">Total Pemasukan</p>
          <p className="text-2xl font-bold tracking-tight">Rp {formatRupiah(summary.pemasukan)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-rose-600 via-red-700 to-red-950 p-6 shadow-[0_12px_40px_rgba(248,113,113,0.18)] ring-1 ring-white/10">
          <p className="text-sm text-red-50/90">Total Pengeluaran</p>
          <p className="text-2xl font-bold tracking-tight">Rp {formatRupiah(summary.pengeluaran)}</p>
        </div>
      </div>

      {/* Blok wishlist ringkas */}
      <div className="tq-card mb-6 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="m-0 text-[16px] font-semibold tracking-tight">Wishlist</h3>
          <span className="text-[12px] text-white/45">Cuplikan target tabungan Anda</span>
        </div>
        {wishlists.length === 0 ? (
          <p className="m-0 text-sm text-white/45">Belum ada wishlist.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {wishlists.slice(0, 6).map((w) => (
              <div
                key={w.id}
                className="tq-card-inner min-w-[200px] flex-1 rounded-xl px-4 py-3 text-[13px]"
              >
                <div className="font-semibold text-white/95">{w.name}</div>
                <div className="mt-1 text-white/50">
                  Rp {formatRupiah(w.saved_amount)} / {formatRupiah(w.target_amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabel histori */}
      <div className="tq-card p-4 md:p-6">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="m-0 text-lg font-semibold tracking-tight">Detail transaksi</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openAddModal('pemasukan')}
              className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(16,185,129,0.25)] transition hover:brightness-110"
            >
              + Pemasukan
            </button>
            <button
              type="button"
              onClick={() => openAddModal('pengeluaran')}
              className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
            >
              + Pengeluaran
            </button>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="tq-field tq-select rounded-xl px-3 py-2 text-sm"
            >
              {getMonthFilterOptions().map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {/* Filter jenis */}
            <div className="flex rounded-xl border border-white/10 overflow-hidden text-sm font-medium">
              {[
                { value: '', label: 'Semua' },
                { value: 'pemasukan', label: 'Pemasukan' },
                { value: 'pengeluaran', label: 'Pengeluaran' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFilterType(opt.value)}
                  className={`px-3 py-2 transition ${
                    filterType === opt.value
                      ? opt.value === 'pemasukan'
                        ? 'bg-emerald-600 text-white'
                        : opt.value === 'pengeluaran'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white/[0.12] text-white'
                      : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Cari keterangan..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              if (searchParams.get('search')) clearSearchParam()
            }}
            className="tq-field min-w-0 flex-1 rounded-xl px-3 py-2.5 text-sm"
          />
          {searchParams.get('search') && (
            <button
              type="button"
              onClick={() => {
                clearSearchParam()
                setSearch('')
              }}
              className="text-[13px] text-emerald-400 hover:text-emerald-300"
            >
              Hapus filter dari dashboard
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 md:hidden">
          {paginatedRows.length === 0 ? (
            <div className="py-10 text-center text-sm text-white/45">Tidak ada transaksi</div>
          ) : (
            paginatedRows.map((item) => (
              <div key={item.id} className="tq-card-inner rounded-xl p-4">
                <div className="mb-2 flex justify-between text-[12px] text-white/50">
                  <span>{formatDate(item.transaction_date)}</span>
                  <span className="text-white/70">Saldo: Rp {formatRupiah(balanceMap.get(item.id) ?? 0)}</span>
                </div>
                <p className="mb-2 text-[14px] text-white/90">{item.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <span className="text-white/45">Jenis</span>
                  <span className="text-right font-medium capitalize text-white/85">{item.type}</span>
                  <span className="text-white/45">Pemasukan</span>
                  <span className="text-right font-mono text-emerald-400">
                    {item.type === 'pemasukan' ? `Rp ${formatRupiah(item.amount)}` : '—'}
                  </span>
                  <span className="text-white/45">Pengeluaran</span>
                  <span className="text-right font-mono text-red-400">
                    {item.type === 'pengeluaran' ? `Rp ${formatRupiah(item.amount)}` : '—'}
                  </span>
                </div>
                <div className="mt-3 flex justify-end gap-4 border-t border-white/10 pt-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="text-[13px] font-medium text-blue-400 hover:text-blue-300"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="text-[13px] font-medium text-red-400 hover:text-red-300"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[920px] text-white">
            <thead className="bg-white/[0.05] text-left text-[13px] text-white/90">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Keterangan</th>
                <th className="p-3">Jenis</th>
                <th className="p-3 text-right">Pemasukan</th>
                <th className="p-3 text-right">Pengeluaran</th>
                <th className="p-3 text-right">Saldo (berjalan)</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/45">
                    Tidak ada transaksi
                  </td>
                </tr>
              ) : (
                paginatedRows.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/[0.06] transition hover:bg-white/[0.04]"
                  >
                    <td className="p-3 whitespace-nowrap">{formatDate(item.transaction_date)}</td>
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 capitalize text-white/80">{item.type}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      {item.type === 'pemasukan' ? `Rp ${formatRupiah(item.amount)}` : '—'}
                    </td>
                    <td className="p-3 text-right font-mono text-red-400">
                      {item.type === 'pengeluaran' ? `Rp ${formatRupiah(item.amount)}` : '—'}
                    </td>
                    <td className="p-3 text-right font-mono text-white/90">
                      Rp {formatRupiah(balanceMap.get(item.id) ?? 0)}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="mr-3 text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {displayedRows.length > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-white/[0.08] pt-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Baris per hal:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setPage(1)
                }}
                className="tq-field tq-select rounded-lg px-2 py-1 text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-sm transition hover:bg-white/[0.1] disabled:opacity-40"
              >
                «
              </button>
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-sm transition hover:bg-white/[0.1] disabled:opacity-40"
              >
                ‹
              </button>
              <span className="px-2 text-xs text-white/60">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-sm transition hover:bg-white/[0.1] disabled:opacity-40"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-sm transition hover:bg-white/[0.1] disabled:opacity-40"
              >
                »
              </button>
            </div>
            <div className="text-xs text-white/45">
              {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, displayedRows.length)} dari{' '}
              {displayedRows.length}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editItem ? 'Edit' : 'Tambah'} ${modalType}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-white/70">Tanggal</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="tq-field w-full rounded-xl px-3 py-2.5"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-white/70">Nominal</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">Rp</span>
              <input
                type="text"
                value={amountDisplay}
                onChange={handleAmountChange}
                placeholder="0"
                className="tq-field w-full rounded-xl py-2.5 pr-3 pl-10"
                required
              />
            </div>
          </div>
          {!editItem && wishlists.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-white/70">
                Hubungkan ke Wishlist (Opsional)
              </label>
              <select
                value={formData.wishlistId}
                onChange={(e) => setFormData({ ...formData, wishlistId: e.target.value })}
                className="tq-field tq-select w-full rounded-xl px-3 py-2.5"
              >
                <option value="">— Pilih Wishlist —</option>
                {wishlists.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Rp {formatRupiah(w.saved_amount)} / Rp {formatRupiah(w.target_amount)})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-white/45">
                Tabungan wishlist bertambah otomatis sesuai nominal (sebut nama wishlist di keterangan agar muncul di
                kolom).
              </p>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-white/70">Keterangan</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="tq-field w-full resize-none rounded-xl px-3 py-2.5"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-white transition hover:bg-white/[0.1]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 font-semibold text-white shadow-[0_8px_28px_rgba(16,185,129,0.25)] transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  )
}
