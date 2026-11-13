import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const { user } = await requireUserSession(event)

  // pastikan profil sesuai role sudah ada (auto-buat kalau belum)
  if (user.peran === 'Petani') {
    await getProfilPetani(event)
  } else {
    await getProfilKonsumen(event)
  }

  const pengguna = await prisma.pengguna.findUnique({
    where: { idPengguna: user.id },
    include: {
      profilpetani: { include: { akunbank: true } },
      profilkonsumen: true,
      alamat: { orderBy: { idAlamat: 'desc' } },
    },
  })

  if (!pengguna) throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan' })

  return pengguna
})
