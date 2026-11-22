export default defineNuxtRouteMiddleware(() => {
  const { user } = useUserSession()
  if (user.value?.peran === 'Petani') {
    return navigateTo('/dashboard?forbidden=true')
  }
})
