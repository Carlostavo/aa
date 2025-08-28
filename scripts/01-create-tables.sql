-- Creating database schema for waste management system
-- Create users table for authentication and roles
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'tecnico', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_content table to store editable content
CREATE TABLE IF NOT EXISTS page_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL,
  content JSONB NOT NULL,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_name)
);

-- Create metas table for goals management
CREATE TABLE IF NOT EXISTS metas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  plazo DATE,
  unidad_medida TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indicadores table for indicators management
CREATE TABLE IF NOT EXISTS indicadores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  meta_id UUID REFERENCES metas(id) ON DELETE CASCADE,
  linea_base DECIMAL,
  unidad TEXT,
  frecuencia TEXT,
  meta_objetivo DECIMAL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create avances table for progress tracking
CREATE TABLE IF NOT EXISTS avances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  indicador_id UUID REFERENCES indicadores(id) ON DELETE CASCADE,
  valor DECIMAL NOT NULL,
  fecha DATE NOT NULL,
  comentario TEXT,
  evidencia_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE avances ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Only admins can insert users" ON users FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Only admins can update users" ON users FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for page_content table
CREATE POLICY "Everyone can view page content" ON page_content FOR SELECT USING (true);
CREATE POLICY "Admins and tecnicos can update page content" ON page_content FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'tecnico')
  )
);

-- Create policies for metas table
CREATE POLICY "Everyone can view metas" ON metas FOR SELECT USING (true);
CREATE POLICY "Only admins can manage metas" ON metas FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for indicadores table
CREATE POLICY "Everyone can view indicadores" ON indicadores FOR SELECT USING (true);
CREATE POLICY "Only admins can manage indicadores" ON indicadores FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for avances table
CREATE POLICY "Everyone can view avances" ON avances FOR SELECT USING (true);
CREATE POLICY "Admins and tecnicos can manage avances" ON avances FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'tecnico')
  )
);
