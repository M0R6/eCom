import { z } from 'zod'

const schema = z.object({
  idAlamat: z.number().int().positive(),
  frekuensi: z.enum(['Harian', 'Mingguan', 'Bulanan']),
  tanggalMulai: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  items: z
    .array(z.object({
      idProduk: z.number().int().positive(),
      jumlah: z.number().int().min(1).max(100)
    }))
    .min(1)
    .max(20)
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const profil = await getProfilKonsumen(event)
  const body = await readValidatedBody(event, schema.parse)

  const mulai = new Date(`${body.tanggalMulai}T00:00:00.000Z`)
  // Tanggal tidak nyata seperti 2026-02-31 lolos regex tapi bergeser saat diparse
  if (Number.isNaN(mulai.getTime()) || mulai.toISOString().slice(0, 10) !== body.tanggalMulai) {
    throw createError({ statusCode: 400, statusMessage: 'Tanggal mulai tidak valid' })
  }
  if (mulai < hariIni()) {
    throw createError({ statusCode: 400, statusMessage: 'Tanggal mulai tidak boleh sebelum hari ini' })
  }

  const alamat = await prisma.alamat.findUnique({ where: { idAlamat: body.idAlamat } })
  if (!alamat || alamat.idPengguna !== user.id) {
    throw createError({ statusCode: 404, statusMessage: 'Alamat tidak ditemukan' })
  }

  const idProduk = body.items.map(i => i.idProduk)
  if (new Set(idProduk).size !== idProduk.length) {
    throw createError({ statusCode: 400, statusMessage: 'Produk yang sama tidak boleh dua kali' })
  }

  const produk = await prisma.produk.findMany({
    where: { idProduk: { in: idProduk }, status: { not: 'Disembunyikan' } },
    select: { idProduk: true }
  })
  if (produk.length !== idProduk.length) {
    throw createError({ statusCode: 404, statusMessage: 'Ada produk yang tidak tersedia' })
  }

  return prisma.langganan.create({
    data: {
      idProfilKonsumen: profil.idKonsumen,
      idAlamat: body.idAlamat,
      frekuensi: body.frekuensi,
      tanggalPengirimanBerikutnya: mulai,
      itemlangganan: { create: body.items.map(i => ({ idProduk: i.idProduk, jumlah: i.jumlah })) }
    },
    include: { itemlangganan: true }
  })
})
