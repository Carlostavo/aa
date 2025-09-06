import '../styles/globals.css';
import Nav from '../components/Nav';
import { EditorProvider } from '../contexts/EditorContext';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const pageSlug = router.pathname === '/' ? 'inicio' : router.pathname.slice(1);

  return (
    <EditorProvider pageSlug={pageSlug}>
      <div className="app">
        <Nav />
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
          <Component {...pageProps} />
        </main>
      </div>
    </EditorProvider>
  );
}

export default MyApp;
