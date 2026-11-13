declare module '#auth-utils' {
  interface User {
    id: number
    nama: string
    email: string
    peran: 'Petani' | 'Konsumen'
  }
}
export {}
