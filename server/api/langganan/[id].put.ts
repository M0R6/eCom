import { z } from 'zod'
import { majukanSampaiHariIni } from '../../utils/langganan'

const schema = z.object({
  status: z.enum(['Aktif', 'Jeda', 'Berhenti'])
})

export default defineEventHandler(async (event) => {
  const profil = await getProfilKonsumen(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'ID langganan tidak valid' })
  }

  const body = await readValidatedBody(event, schema.parse)
  const langganan = await prisma.langganan.findFirst({
    where: { idLangganan: id, idProfilKonsumen: profil.idKonsumen },
    select: {
      idLangganan: true,
      status: true,
      frekuensi: true,
      tanggalPengirimanBerikutnya: true
    }
  })

  if (!langganan) {
    throw createError({ statusCode: 404, statusMessage: 'Langganan tidak ditemukan' })
  }

  const statusSaatIni = langganan.status ?? 'Aktif'

  if (statusSaatIni === 'Berhenti' && body.status !== 'Berhenti') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Langganan yang sudah dihentikan tidak dapat diaktifkan kembali. Buat langganan baru.'
    })
  }

  if (statusSaatIni === body.status) {
    return { ok: true, langganan }
  }

  const tanggalBerikutnya = body.status === 'Aktif'
    ? majukanSampaiHariIni(langganan.tanggalPengirimanBerikutnya, langganan.frekuensi)
    : undefined

  const hasil = await prisma.langganan.updateMany({
    where: {
      idLangganan: id,
      idProfilKonsumen: profil.idKonsumen,
      status: langganan.status
    },
    data: {
      status: body.status,
      ...(tanggalBerikutnya ? { tanggalPengirimanBerikutnya: tanggalBerikutnya } : {})
    }
  })

  if (hasil.count !== 1) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Status langganan berubah. Muat ulang halaman lalu coba lagi.'
    })
  }

  const terbaru = await prisma.langganan.findUnique({
    where: { idLangganan: id },
    select: {
      idLangganan: true,
      status: true,
      frekuensi: true,
      tanggalPengirimanBerikutnya: true
    }
  })

  return { ok: true, langganan: terbaru }
})
