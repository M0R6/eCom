export default defineNuxtRouteMiddleware(() => {
   const { loggedIn, user } = useUserSession()
   if (!loggedIn.value) return navigateTo('//login?unauthorized=true')
   if(user.value?.role !== true){
      return navigateTo('/?notfarmer=true')
   }
})