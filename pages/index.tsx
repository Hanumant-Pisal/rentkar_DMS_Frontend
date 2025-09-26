import { GetServerSideProps } from 'next';

export default function HomePage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Server-side redirect to login page
  return {
    redirect: {
      destination: '/auth/login',
      permanent: false,
    },
  };
};