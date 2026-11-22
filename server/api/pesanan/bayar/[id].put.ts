export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const profil = await getProfilKonsumen(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'ID pesanan tidak valid' })
  }

  const pesanan = await prisma.pesanan.findUnique({
    where: { idPesanan: id }
  })
  if (!pesanan || pesanan.idProfilKonsumen !== profil.idKonsumen) {
    throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan' })
  }

  if (pesanan.status !== 'Menunggu_Pembayaran') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Pesanan sudah dibayar atau statusnya tidak lagi menunggu pembayaran'
    })
  }

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.pesanan.updateMany({
      where: {
        idPesanan: id,
        status: 'Menunggu_Pembayaran'
      },
      data: {
        status: 'Diproses',
        diperbaruiPada: new Date()
      }
    })

    if (count === 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Status pesanan baru saja berubah, muat ulang halaman'
      })
    }

    await tx.riwayatstatuspesanan.create({
      data: {
        idPesanan: id,
        idDiubahOlehPengguna: user.id,
        statusLama: 'Menunggu_Pembayaran',
        statusBaru: 'Diproses',
        catatan: 'Pembayaran dikonfirmasi oleh konsumen'
      }
    })

    return tx.pesanan.findUnique({
      where: { idPesanan: id },
      include: { riwayatstatuspesanan: true }
    })
  })
})