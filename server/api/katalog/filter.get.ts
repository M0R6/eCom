export default defineEventHandler(async () => {
  const [kategori, petani] = await prisma.$transaction([
    prisma.kategori.findMany({ orderBy: { nama: 'asc' } }),
    prisma.profilpetani.findMany({
      where: { produk: { some: { status: 'Tersedia' } } },
      select: { idPetani: true, namaPertanian: true, alamat: true },
      orderBy: { namaPertanian: 'asc' },
    }),
  ])

  return { kategori, petani }
})