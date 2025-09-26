import { NextPage } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
const HomePage: NextPage = () => {
  const router = useRouter()
  useEffect(() => {
    router.push('/auth/login')
  }, [router])
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
      <Head>
        <title>DMS</title>
        <meta name="description" content="Streamline your rental management with Rentkar's powerful platform" />
      </Head>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-300">Redirecting to login...</p>
      </div>
    </div>
  )
}
export default HomePage