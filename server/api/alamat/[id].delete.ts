export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const alamat = await prisma.alamat.findUnique({ where: { idAlamat: id } })
  if (!alamat || alamat.idPengguna !== user.id) {
    throw createError({ statusCode: 404, statusMessage: 'Alamat tidak ditemukan' })
  }

  // langganan aktif mereferensi alamat ini — cegah penghapusan
  const dipakai = await prisma.langganan.findFirst({
    where: { idAlamat: id, status: 'Aktif' },
  })
  if (dipakai) {
    throw createError({ statusCode: 409, statusMessage: 'Alamat dipakai langganan aktif' })
  }

  await prisma.alamat.delete({ where: { idAlamat: id } })
  return { ok: true }
})
