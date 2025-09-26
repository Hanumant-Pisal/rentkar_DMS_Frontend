import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import LoginForm from "../../components/auth/LoginForm";
export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
      <Head>
        <title>DMS</title>
        <meta name="description" content="Login to your Rentkar account" />
      </Head>
      <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Sign In</h1>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/10">
            <LoginForm />
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
     
    </div>
  );
}
