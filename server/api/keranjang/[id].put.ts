import { z } from 'zod'

const schema = z.object({
  jumlah: z.number().int().min(1).max(999)
})

export default defineEventHandler(async (event) => {
  const profil = await getProfilKonsumen(event)
  const idItem = Number(getRouterParam(event, 'id'))
  if (!idItem || Number.isNaN(idItem)) {
    throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })
  }

  const body = await readValidatedBody(event, schema.parse)

  const item = await prisma.itemkeranjang.findUnique({
    where: { idItemKeranjang: idItem },
    include: { keranjang: { select: { idProfilKonsumen: true } }, produk: { select: { stok: true } } }
  })
  if (!item || item.keranjang.idProfilKonsumen !== profil.idKonsumen) {
    throw createError({ statusCode: 404, statusMessage: 'Item tidak ditemukan' })
  }
  if (item.produk.stok !== null && item.produk.stok < body.jumlah) {
    throw createError({ statusCode: 400, statusMessage: 'Stok tidak mencukupi' })
  }

  return prisma.itemkeranjang.update({
    where: { idItemKeranjang: idItem },
    data: { jumlah: body.jumlah }
  })
})
