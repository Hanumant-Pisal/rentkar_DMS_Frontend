import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '../styles/globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';
import 'leaflet/dist/leaflet.css';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100 text-gray-900">
          <Component {...pageProps} />
          <Toaster position="top-center" richColors />
        </div>
      </AuthProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}