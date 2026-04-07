import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './routes/AppRouter';

// Khởi tạo Query Client để caching API calls
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Tránh gọi lại API liên tục khi chuyển tab
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;