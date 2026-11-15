export const LABEL_STATUS_PESANAN: Record<string, string> = {
  Menunggu_Pembayaran: 'Menunggu Pembayaran',
  Diproses: 'Diproses',
  Dikirim: 'Dikirim',
  Selesai: 'Selesai',
  Dibatalkan: 'Dibatalkan'
}

/** Perubahan status yang boleh dilakukan petani. Tidak ada jalan mundur. */
export const TRANSISI_PESANAN_PETANI: Record<string, string[]> = {
  Menunggu_Pembayaran: ['Diproses', 'Dibatalkan'],
  Diproses: ['Dikirim', 'Dibatalkan'],
  Dikirim: ['Selesai'],
  Selesai: [],
  Dibatalkan: []
}
