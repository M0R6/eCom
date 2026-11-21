import { z } from 'zod'

const schema = z.object({
  idAlamat: z.number().int().positive()
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const profil = await getProfilKonsumen(event)
  const body = await readValidatedBody(event, schema.parse)

  const alamat = await prisma.alamat.findUnique({ where: { idAlamat: body.idAlamat } })
  if (!alamat || alamat.idPengguna !== user.id) {
    throw createError({ statusCode: 404, statusMessage: 'Alamat tidak ditemukan' })
  }

  const keranjang = await prisma.keranjang.findFirst({
    where: { idProfilKonsumen: profil.idKonsumen },
    include: {
      itemkeranjang: {
        include: { produk: { select: { idProduk: true, nama: true, harga: true, stok: true, status: true } } }
      }
    }
  })
  if (!keranjang || !keranjang.itemkeranjang.length) {
    throw createError({ statusCode: 400, statusMessage: 'Keranjang kosong' })
  }

  for (const item of keranjang.itemkeranjang) {
    if (item.produk.status !== 'Tersedia') {
      throw createError({ statusCode: 400, statusMessage: `Produk "${item.produk.nama}" tidak tersedia` })
    }
    if (item.produk.stok !== null && item.produk.stok < item.jumlah) {
      throw createError({ statusCode: 400, statusMessage: `Stok "${item.produk.nama}" tidak mencukupi` })
    }
  }

  const alamatTeks = [alamat.namaPenerima, alamat.detailAlamat, alamat.desa, alamat.kecamatan, alamat.kota, alamat.provinsi, alamat.kodePos]
    .filter(Boolean).join(', ')

  const items = keranjang.itemkeranjang.map(i => ({
    idProduk: i.produk.idProduk,
    namaProduk: i.produk.nama,
    harga: i.produk.harga,
    jumlah: i.jumlah,
    subtotal: Number(i.produk.harga) * i.jumlah
  }))
  const jumlahTotal = items.reduce((s, i) => s + i.subtotal, 0)

  const [pesanan] = await prisma.$transaction([
    prisma.pesanan.create({
      data: {
        idProfilKonsumen: profil.idKonsumen,
        jumlahTotal,
        alamatPengiriman: alamatTeks,
        barangpesanan: { create: items },
        riwayatstatuspesanan: {
          create: {
            idDiubahOlehPengguna: user.id,
            statusBaru: 'Menunggu_Pembayaran',
            catatan: 'Pesanan dibuat'
          }
        }
      },
      include: { barangpesanan: true }
    }),
    prisma.itemkeranjang.deleteMany({
      where: { idKeranjang: keranjang.idKeranjang }
    })
  ])

  return pesanan
})
