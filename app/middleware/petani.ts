export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession()
  if (!loggedIn.value) return navigateTo('/login?unauthorized=true')
  if (user.value?.peran !== 'Petani') {
    return navigateTo('/?notfarmer=true')
  }
})
