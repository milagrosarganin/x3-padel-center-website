-- Crear tabla de negocios
CREATE TABLE IF NOT EXISTS negocios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de usuarios (extendiendo auth.users)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'empleado' CHECK (rol IN ('admin', 'empleado')),
  negocio_id UUID REFERENCES negocios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  stock INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  precio DECIMAL(10,2) NOT NULL,
  proveedor VARCHAR(255),
  ultima_compra DATE,
  usuario_id UUID REFERENCES auth.users(id),
  negocio_id UUID REFERENCES negocios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  mesa VARCHAR(100) NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(20) CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
  estado VARCHAR(20) DEFAULT 'completada' CHECK (estado IN ('completada', 'cancelada')),
  usuario_id UUID REFERENCES auth.users(id),
  negocio_id UUID REFERENCES negocios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  metodo_pago VARCHAR(20) CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
  proveedor VARCHAR(255),
  comprobante VARCHAR(255),
  usuario_id UUID REFERENCES auth.users(id),
  negocio_id UUID REFERENCES negocios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  contacto VARCHAR(255),
  telefono VARCHAR(50),
  email VARCHAR(255),
  direccion TEXT,
  productos TEXT[],
  ultima_compra DATE,
  total_compras DECIMAL(10,2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  usuario_id UUID REFERENCES auth.users(id),
  negocio_id UUID REFERENCES negocios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de arqueos de caja
CREATE TABLE IF NOT EXISTS arqueos_caja (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  hora_apertura TIME NOT NULL,
  hora_cierre TIME,
  monto_inicial DECIMAL(10,2) NOT NULL,
  ventas_efectivo DECIMAL(10,2) DEFAULT 0,
  ventas_tarjeta DECIMAL(10,2) DEFAULT 0,
  ventas_transferencia DECIMAL(10,2) DEFAULT 0,
  gastos DECIMAL(10,2) DEFAULT 0,
  monto_final DECIMAL(10,2),
  diferencia DECIMAL(10,2),
  estado VARCHAR(20) DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada')),
  usuario_id UUID REFERENCES auth.users(id),
  negocio_id UUID REFERENCES negocios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE arqueos_caja ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON usuarios;
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON usuarios
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON usuarios;
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Los usuarios pueden insertar su propio perfil" ON usuarios;
CREATE POLICY "Los usuarios pueden insertar su propio perfil" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para productos
DROP POLICY IF EXISTS "Los usuarios pueden ver productos de su negocio" ON productos;
CREATE POLICY "Los usuarios pueden ver productos de su negocio" ON productos
  FOR SELECT USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Los usuarios pueden insertar productos en su negocio" ON productos;
CREATE POLICY "Los usuarios pueden insertar productos en su negocio" ON productos
  FOR INSERT WITH CHECK (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Los usuarios pueden actualizar productos de su negocio" ON productos;
CREATE POLICY "Los usuarios pueden actualizar productos de su negocio" ON productos
  FOR UPDATE USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Políticas para ventas
DROP POLICY IF EXISTS "Los usuarios pueden ver ventas de su negocio" ON ventas;
CREATE POLICY "Los usuarios pueden ver ventas de su negocio" ON ventas
  FOR SELECT USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Los usuarios pueden insertar ventas en su negocio" ON ventas;
CREATE POLICY "Los usuarios pueden insertar ventas en su negocio" ON ventas
  FOR INSERT WITH CHECK (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Función para crear usuario automáticamente
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, rol)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'), 'empleado');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
