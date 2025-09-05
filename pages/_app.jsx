import '../styles/globals.css'
import Nav from '../components/Nav'
import Head from 'next/head'
import { EditProvider } from '../contexts/EditContext'

export default function App({ Component, pageProps }) {
  return (
    <EditProvider>
      <Head>
        <title>Gestión de Residuos Sólidos</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.3/css/all.min.css" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
          <Component {...pageProps} />
        </main>
      </div>
    </EditProvider>
  )
}
