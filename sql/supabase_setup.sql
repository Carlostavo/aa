-- Tabla de páginas
create table if not exists public.paginas (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  content text,
  updated_at timestamptz default now()
);

-- Tabla de roles
create table if not exists public.user_roles (
  user_id uuid primary key,
  role text not null
);

-- Crear usuario admin inicial en auth y asignarle rol
do $$
declare
  new_user uuid;
begin
  insert into auth.users (id, email, encrypted_password)
  values (
    gen_random_uuid(),
    'admin@residuos.com',
    crypt('Admin1234', gen_salt('bf'))
  )
  returning id into new_user;

  insert into public.user_roles (user_id, role)
  values (new_user, 'admin');
end;
$$;
