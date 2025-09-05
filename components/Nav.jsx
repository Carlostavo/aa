import Link from 'next/link'
import Login from './Login'

export default function Nav(){
  return (
    <nav className="flex justify-between items-center">
      <div className="flex gap-6 font-semibold">
        <Link href="/">Inicio</Link>
        <Link href="/indicadores">Indicadores</Link>
        <Link href="/metas">Metas</Link>
        <Link href="/avances">Avances</Link>
        <Link href="/reportes">Reportes</Link>
        <Link href="/formularios">Formularios</Link>
      </div>
      <Login />
    </nav>
  )
}