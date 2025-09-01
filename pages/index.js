import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [page, setPage] = useState('home');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadPage(page);
  }, [page]);

  async function loadPage(p) {
    const { data, error } = await supabase
      .from('paginas')
      .select('contenido_html')
      .eq('nombre', p)
      .single();
    if (error) {
      console.error('❌ Error cargando', error);
    } else if (data) {
      setContent(data.contenido_html);
    } else {
      setContent('<h2>Nueva página vacía</h2>');
    }
  }

  async function savePage() {
    const { error } = await supabase
      .from('paginas')
      .upsert({ nombre: page, contenido_html: content });
    if (error) console.error('❌ Error guardando', error);
    else alert('✅ Guardado en Supabase');
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Gestión de Residuos — Editor</h1>
      <textarea
        style={{ width: '100%', minHeight: '300px' }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div style={{ marginTop: 20 }}>
        <button onClick={savePage}>Guardar</button>
        <button onClick={() => loadPage(page)}>Recargar</button>
      </div>
    </div>
  );
}
