import Link from 'next/link'
import Login from './Login'

export default function Nav(){
  return (
    <nav className="topbar">
      <div className="brand">
        <i className="fa-solid fa-recycle fa-xl"></i> 
        <span>Gestión RS</span>
      </div>
      <div className="nav">
        <Link href="/" className="nav-link active" data-page="home">Inicio</Link>
        <Link href="/indicadores" className="nav-link" data-page="indicadores">Indicadores</Link>
        <Link href="/metas" className="nav-link disabled" data-page="metas">Metas</Link>
        <Link href="/avances" className="nav-link disabled" data-page="avances">Avances</Link>
        <Link href="/reportes" className="nav-link disabled" data-page="reportes">Reportes</Link>
        <Link href="/formularios" className="nav-link" data-page="formularios">Formularios</Link>
        <Login />
      </div>
    </nav>
  )
}
