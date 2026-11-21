export default defineEventHandler(async (event) => {
  const profil = await getProfilKonsumen(event)
  const idItem = Number(getRouterParam(event, 'id'))
  if (!idItem || Number.isNaN(idItem)) {
    throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })
  }

  const item = await prisma.itemkeranjang.findUnique({
    where: { idItemKeranjang: idItem },
    include: { keranjang: { select: { idProfilKonsumen: true } } }
  })
  if (!item || item.keranjang.idProfilKonsumen !== profil.idKonsumen) {
    throw createError({ statusCode: 404, statusMessage: 'Item tidak ditemukan' })
  }

  await prisma.itemkeranjang.delete({ where: { idItemKeranjang: idItem } })
  return { deleted: true }
})
