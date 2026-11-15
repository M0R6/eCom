export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID percakapan tidak valid'
    })
  }

  const percakapan = await prisma.percakapanchat.findUnique({
    where: { idPercakapanChat: id }
  })

  if (!percakapan || percakapan.idPengguna !== user.id) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Percakapan tidak ditemukan'
    })
  }

  return prisma.pesanchat.findMany({
    where: { idPercakapan: id },
    orderBy: [
      { dibuatPada: 'asc' },
      { idPesanChat: 'asc' }
    ]
  })
})
