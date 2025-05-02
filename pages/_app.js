import { useEffect } from 'react';
import { AuthProvider } from '../hooks/useAuth';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  // Remove the server-side injected CSS when running in browser
  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;