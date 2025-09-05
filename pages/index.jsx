import Editor from '../components/Editor'
import EditToggle from '../components/EditToggle'

export default function Home(){
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-4">Inicio</h1>
      <p className="mb-4">Bienvenido al sistema de gestión de residuos sólidos.</p>
      <EditToggle>
        <Editor slug="inicio" initial="Contenido editable de Inicio" />
      </EditToggle>
    </div>
  )
}