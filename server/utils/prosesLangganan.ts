type LanggananJatuhTempo = Awaited<ReturnType<typeof ambilLanggananJatuhTempo>>[number]

/** Jadwal berikutnya harus setelah hari ini, kalau tidak langganan diproses dua kali sehari. */
function jadwalSetelahHariIni(dari: Date, frekuensi: LanggananJatuhTempo['frekuensi']) {
  const batas = hariIni()
  let d = tambahPeriode(dari, frekuensi)
  while (d <= batas) d = tambahPeriode(d, frekuensi)
  return d
}

function formatAlamat(a: LanggananJatuhTempo['alamat']) {
  const wilayah = [a.detailAlamat, a.desa, a.kecamatan, a.kota, a.provinsi]
    .filter(Boolean)
    .join(', ')
  const penerima = [a.namaPenerima, a.nomorTelepon].filter(Boolean).join(', ')
  return `${wilayah} ${a.kodePos ?? ''} (${penerima})`.replace(/\s+/g, ' ').trim()
}

async function prosesSatu(l: LanggananJatuhTempo) {
  return prisma.$transaction(async (tx) => {
    // Klaim jadwal dulu: proses lain yang berjalan bersamaan akan mendapat count 0
    const jadwalBaru = jadwalSetelahHariIni(l.tanggalPengirimanBerikutnya, l.frekuensi)
    const klaim = await tx.langganan.updateMany({
      where: {
        idLangganan: l.idLangganan,
        status: 'Aktif',
        tanggalPengirimanBerikutnya: l.tanggalPengirimanBerikutnya
      },
      data: { tanggalPengirimanBerikutnya: jadwalBaru }
    })
    if (klaim.count === 0) return { dibuat: 0, dilewati: 0 }

    const konsumen = await tx.profilkonsumen.findUniqueOrThrow({
      where: { idKonsumen: l.idProfilKonsumen },
      select: { idPengguna: true }
    })
    const produk = await tx.produk.findMany({
      where: { idProduk: { in: l.itemlangganan.map(i => i.idProduk) } }
    })
    const petaProduk = new Map(produk.map(p => [p.idProduk, p]))

    // Satu pesanan per petani supaya petani bisa mengubah status pesanannya sendiri
    const perPetani = new Map<number, typeof l.itemlangganan>()
    for (const item of l.itemlangganan) {
      const p = petaProduk.get(item.idProduk)
      if (!p) continue
      perPetani.set(p.idProfilPetani, [...(perPetani.get(p.idProfilPetani) ?? []), item])
    }

    let dibuat = 0
    let dilewati = 0

    for (const [idPetani, items] of perPetani) {
      const tersedia = items.every((i) => {
        const p = petaProduk.get(i.idProduk)!
        return p.status !== 'Habis' && p.status !== 'Disembunyikan' && (p.stok ?? 0) >= i.jumlah
      })
      if (!tersedia) {
        dilewati++
        console.warn(`[langganan #${l.idLangganan}] dilewati, stok petani #${idPetani} tidak cukup`)
        continue
      }

      const barang = items.map((i) => {
        const p = petaProduk.get(i.idProduk)!
        return {
          idProduk: p.idProduk,
          namaProduk: p.nama,
          harga: p.harga,
          jumlah: i.jumlah,
          subtotal: Number(p.harga) * i.jumlah
        }
      })

      await tx.pesanan.create({
        data: {
          idProfilKonsumen: l.idProfilKonsumen,
          status: 'Menunggu_Pembayaran',
          jumlahTotal: barang.reduce((jumlah, b) => jumlah + b.subtotal, 0),
          alamatPengiriman: formatAlamat(l.alamat),
          barangpesanan: { create: barang },
          riwayatstatuspesanan: {
            create: [{
              idDiubahOlehPengguna: konsumen.idPengguna,
              statusLama: null,
              statusBaru: LABEL_STATUS_PESANAN.Menunggu_Pembayaran,
              catatan: `Dibuat otomatis dari langganan #${l.idLangganan}`
            }]
          }
        }
      })

      for (const i of items) {
        const kurang = await tx.produk.updateMany({
          where: { idProduk: i.idProduk, stok: { gte: i.jumlah } },
          data: { stok: { decrement: i.jumlah } }
        })
        // Stok keburu habis oleh pembeli lain: batalkan seluruh transaksi
        if (kurang.count === 0) throw new Error(`Stok produk #${i.idProduk} berubah saat diproses`)
        await tx.produk.updateMany({
          where: { idProduk: i.idProduk, stok: 0, status: 'Tersedia' },
          data: { status: 'Habis' }
        })
      }
      dibuat++
    }

    return { dibuat, dilewati }
  })
}

export async function prosesLanggananJatuhTempo() {
  const daftar = await ambilLanggananJatuhTempo()
  const total = { langganan: daftar.length, pesananDibuat: 0, dilewati: 0, gagal: 0 }

  for (const l of daftar) {
    try {
      const hasil = await prosesSatu(l)
      total.pesananDibuat += hasil.dibuat
      total.dilewati += hasil.dilewati
    } catch (err) {
      total.gagal++
      console.error(`[langganan #${l.idLangganan}] gagal diproses`, err)
    }
  }
  return total
}
