import { z } from 'zod'

const querySchema = z.object({
  q: z.string().trim().optional(),
  kategori: z.string().optional(),                 // "1,2,3"
  min: z.coerce.number().nonnegative().optional(),
  max: z.coerce.number().positive().optional(),
  petani: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(9),
})

export default defineEventHandler(async (event) => {
  const { q, kategori, min, max, petani, page, limit } = querySchema.parse(getQuery(event))

  const kategoriIds = kategori
    ?.split(',')
    .map(Number)
    .filter(n => Number.isInteger(n) && n > 0) ?? []

  const where = {
    status: { in: ['Tersedia', 'Habis'] as const },  // 'Disembunyikan' tidak pernah tampil
    ...(q ? { nama: { contains: q } } : {}),
    ...(kategoriIds.length ? { idKategori: { in: kategoriIds } } : {}),
    ...(min !== undefined || max !== undefined
      ? { harga: { gte: min, lte: max } }
      : {}),
    ...(petani ? { idProfilPetani: petani } : {}),
  }

  const [total, items] = await prisma.$transaction([
    prisma.produk.count({ where }),
    prisma.produk.findMany({
      where,
      orderBy: [{ status: 'asc' }, { dibuatPada: 'desc' }], // Tersedia dulu, lalu terbaru
      skip: (page - 1) * limit,
      take: limit,
      include: {
        kategori: { select: { idKategori: true, nama: true } },
        profilpetani: { select: { idPetani: true, namaPertanian: true, alamat: true } },
        gambarproduk: { orderBy: { urutanTampil: 'asc' }, take: 1 }, // cover saja
      },
    }),
  ])

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
})