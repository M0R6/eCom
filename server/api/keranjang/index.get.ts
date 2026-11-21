export default defineEventHandler(async (event) => {
  const profil = await getProfilKonsumen(event)

  let keranjang = await prisma.keranjang.findFirst({
    where: { idProfilKonsumen: profil.idKonsumen },
    include: {
      itemkeranjang: {
        include: {
          produk: {
            select: {
              idProduk: true,
              nama: true,
              harga: true,
              stok: true,
              satuan: true,
              status: true,
              gambarproduk: { select: { tautanGambar: true }, orderBy: { urutanTampil: 'asc' }, take: 1 }
            }
          }
        }
      }
    }
  })

  if (!keranjang) {
    keranjang = await prisma.keranjang.create({
      data: { idProfilKonsumen: profil.idKonsumen },
      include: {
        itemkeranjang: {
          include: {
            produk: {
              select: {
                idProduk: true,
                nama: true,
                harga: true,
                stok: true,
                satuan: true,
                status: true,
                gambarproduk: { select: { tautanGambar: true }, orderBy: { urutanTampil: 'asc' }, take: 1 }
              }
            }
          }
        }
      }
    })
  }

  return keranjang
})
