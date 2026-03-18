export default function GoogleLoginButton() {
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/redirect`
  }

  return (
    <button onClick={handleLogin}>
      Sign in with Google
    </button>
  )
}