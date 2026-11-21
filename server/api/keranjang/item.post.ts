import { z } from 'zod'

const schema = z.object({
  idProduk: z.number().int().positive(),
  jumlah: z.number().int().min(1).max(999)
})

export default defineEventHandler(async (event) => {
  const profil = await getProfilKonsumen(event)
  const body = await readValidatedBody(event, schema.parse)

  const produk = await prisma.produk.findUnique({
    where: { idProduk: body.idProduk },
    select: { idProduk: true, status: true, stok: true }
  })
  if (!produk || produk.status === 'Disembunyikan') {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
  }
  if (produk.status === 'Habis' || (produk.stok !== null && produk.stok < body.jumlah)) {
    throw createError({ statusCode: 400, statusMessage: 'Stok tidak mencukupi' })
  }

  let keranjang = await prisma.keranjang.findFirst({
    where: { idProfilKonsumen: profil.idKonsumen }
  })
  if (!keranjang) {
    keranjang = await prisma.keranjang.create({
      data: { idProfilKonsumen: profil.idKonsumen }
    })
  }

  const existing = await prisma.itemkeranjang.findFirst({
    where: { idKeranjang: keranjang.idKeranjang, idProduk: body.idProduk }
  })

  if (existing) {
    return prisma.itemkeranjang.update({
      where: { idItemKeranjang: existing.idItemKeranjang },
      data: { jumlah: existing.jumlah + body.jumlah }
    })
  }

  return prisma.itemkeranjang.create({
    data: {
      idKeranjang: keranjang.idKeranjang,
      idProduk: body.idProduk,
      jumlah: body.jumlah
    }
  })
})
