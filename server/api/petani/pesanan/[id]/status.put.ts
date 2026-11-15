import { z } from 'zod'

const schema = z.object({
  status: z.enum(['Diproses', 'Dikirim', 'Selesai', 'Dibatalkan']),
  catatan: z.string().trim().max(500).optional()
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const profil = await getProfilPetani(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'ID pesanan tidak valid' })
  }

  const body = await readValidatedBody(event, schema.parse)

  if (body.status === 'Dibatalkan' && !body.catatan) {
    throw createError({ statusCode: 400, statusMessage: 'Alasan pembatalan wajib diisi' })
  }

  return prisma.$transaction(async (tx) => {
    const pesanan = await tx.pesanan.findUnique({
      where: { idPesanan: id },
      include: { barangpesanan: { include: { produk: { select: { idProfilPetani: true } } } } }
    })

    const adaBarangku = pesanan?.barangpesanan.some(
      b => b.produk?.idProfilPetani === profil.idPetani
    )
    if (!pesanan || !adaBarangku) {
      throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan' })
    }

    const semuaMilikku = pesanan.barangpesanan.every(
      b => b.idProduk === null || b.produk?.idProfilPetani === profil.idPetani
    )
    if (!semuaMilikku) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Pesanan ini berisi produk petani lain, status belum bisa diubah dari sini'
      })
    }

    const statusLama = pesanan.status ?? 'Menunggu_Pembayaran'
    if (!(TRANSISI_PESANAN_PETANI[statusLama] ?? []).includes(body.status)) {
      throw createError({
        statusCode: 409,
        statusMessage: `Pesanan berstatus ${LABEL_STATUS_PESANAN[statusLama]} tidak bisa diubah ke ${LABEL_STATUS_PESANAN[body.status]}`
      })
    }

    // Syarat status lama di where mencegah dua perubahan bersamaan lolos berdua
    const { count } = await tx.pesanan.updateMany({
      where: { idPesanan: id, status: statusLama },
      data: { status: body.status, diperbaruiPada: new Date() }
    })
    if (count === 0) {
      throw createError({ statusCode: 409, statusMessage: 'Status pesanan baru saja berubah, muat ulang halaman' })
    }

    await tx.riwayatstatuspesanan.create({
      data: {
        idPesanan: id,
        idDiubahOlehPengguna: user.id,
        statusLama: LABEL_STATUS_PESANAN[statusLama],
        statusBaru: LABEL_STATUS_PESANAN[body.status],
        catatan: body.catatan || null
      }
    })

    // Stok dikurangi saat checkout, jadi pembatalan harus mengembalikannya
    if (body.status === 'Dibatalkan') {
      for (const barang of pesanan.barangpesanan) {
        if (barang.idProduk === null) continue
        await tx.produk.update({
          where: { idProduk: barang.idProduk },
          data: { stok: { increment: barang.jumlah } }
        })
        await tx.produk.updateMany({
          where: { idProduk: barang.idProduk, status: 'Habis' },
          data: { status: 'Tersedia' }
        })
      }
    }

    return { ok: true, status: body.status }
  })
})
