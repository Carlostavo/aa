import '../styles/globals.css'
import Nav from '../components/Nav'
import Head from 'next/head'
import { AuthProvider } from '../contexts/AuthContext'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Gestión de Residuos Sólidos</title>
        <meta name="description" content="Sistema de gestión de residuos sólidos con indicadores, metas y reportes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.3/css/all.min.css" />
      </Head>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
            <Component {...pageProps} />
          </main>
        </div>
      </AuthProvider>
    </>
  )
}
