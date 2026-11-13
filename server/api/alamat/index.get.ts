export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  return prisma.alamat.findMany({
    where: { idPengguna: user.id },
    orderBy: { idAlamat: 'desc' },
  })
})
