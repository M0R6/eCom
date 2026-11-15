type Frekuensi = 'Harian' | 'Mingguan' | 'Bulanan'

/** Tanggal hari ini di WIB, disimpan sebagai UTC 00:00 agar cocok dengan kolom DATE. */
export function hariIni() {
  const iso = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
  return new Date(`${iso}T00:00:00.000Z`)
}

export function tambahPeriode(tanggal: Date, frekuensi: Frekuensi) {
  const d = new Date(tanggal)
  if (frekuensi === 'Harian') {
    d.setUTCDate(d.getUTCDate() + 1)
  } else if (frekuensi === 'Mingguan') {
    d.setUTCDate(d.getUTCDate() + 7)
  } else {
    const hari = d.getUTCDate()
    d.setUTCDate(1)
    d.setUTCMonth(d.getUTCMonth() + 1)
    const akhirBulan = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
    d.setUTCDate(Math.min(hari, akhirBulan))
  }
  return d
}

/** Dipakai saat langganan dilanjutkan dari Jeda: lompati jadwal yang sudah lewat. */
export function majukanSampaiHariIni(tanggal: Date, frekuensi: Frekuensi) {
  const batas = hariIni()
  let d = tanggal
  while (d < batas) d = tambahPeriode(d, frekuensi)
  return d
}

/** Langganan Aktif yang jadwalnya jatuh tempo. Dipakai scheduler nanti. */
export function ambilLanggananJatuhTempo() {
  return prisma.langganan.findMany({
    where: { status: 'Aktif', tanggalPengirimanBerikutnya: { lte: hariIni() } },
    include: { itemlangganan: true, alamat: true }
  })
}
