import '../styles/globals.css'
import Nav from '../components/Nav'

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <Component {...pageProps} />
      </main>
    </div>
  )
}
