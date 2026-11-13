/**
 * Ambil profil petani milik user yang sedang login.
 * Auto-buat kalau belum ada (misal user lama dari skema sebelumnya).
 */
export async function getProfilPetani(event: Parameters<typeof requireUserSession>[0]) {
  const { user } = await requireUserSession(event)

  if (user.peran !== 'Petani') {
    throw createError({ statusCode: 403, statusMessage: 'Khusus akun Petani' })
  }

  let profil = await prisma.profilpetani.findUnique({
    where: { idPengguna: user.id },
  })
  if (!profil) {
    profil = await prisma.profilpetani.create({ data: { idPengguna: user.id } })
  }
  return profil
}

/** Ambil profil konsumen milik user yang sedang login (auto-buat). */
export async function getProfilKonsumen(event: Parameters<typeof requireUserSession>[0]) {
  const { user } = await requireUserSession(event)

  if (user.peran !== 'Konsumen') {
    throw createError({ statusCode: 403, statusMessage: 'Khusus akun Konsumen' })
  }

  let profil = await prisma.profilkonsumen.findUnique({
    where: { idPengguna: user.id },
  })
  if (!profil) {
    profil = await prisma.profilkonsumen.create({ data: { idPengguna: user.id } })
  }
  return profil
}
