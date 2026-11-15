import { z } from 'zod'

const schema = z.object({
  nama: z.string().min(3).max(150),
  deskripsi: z.string().optional(),
  harga: z.number().positive(),
  stok: z.number().int().min(0),
  satuan: z.string().min(1).max(20),
  status: z.enum(['Tersedia', 'Habis', 'Disembunyikan']),
  idKategori: z.number().nullable(),
})

export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, schema.parse)

  const produk = await prisma.produk.findUnique({ where: { idProduk: id } })
  if (!produk || produk.idProfilPetani !== profil.idPetani) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
  }

  return prisma.produk.update({ where: { idProduk: id }, data: body })
})
