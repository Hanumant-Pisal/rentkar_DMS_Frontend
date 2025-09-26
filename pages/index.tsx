import { GetServerSideProps } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();
  
  // Client-side redirect as fallback
  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Server-side redirect
  return {
    redirect: {
      destination: '/auth/login',
      permanent: false,
    },
  };
};