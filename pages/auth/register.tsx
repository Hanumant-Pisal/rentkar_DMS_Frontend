import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import RegisterForm from "../../components/auth/RegisterForm";
export default function Register() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
      <Head>
        <title>Create Account - Rentkar</title>
        <meta name="description" content="Create your Rentkar account" />
      </Head>
      <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Sign Up</h1>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/10">
            <RegisterForm />
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
     
    </div>
  );
}
