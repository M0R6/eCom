export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession()
  if (loggedIn && user.value?.peran === 'Petani') return navigateTo('/dashboard')
  else return navigateTo('/katalog')
})
