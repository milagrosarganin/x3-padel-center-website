-- This script is for initial database setup.
-- It's recommended to run create-tables.sql and add-functions.sql separately
-- for better modularity in a real development workflow.

-- Enable uuid-ossp extension for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Tables
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  full_name text,
  business_name text,
  email text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own user data." ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own user data." ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own user data." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Add a trigger to automatically create a user entry when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, business_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'business_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Table for products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are visible to their owners." ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can insert products." ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update products." ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete products." ON public.products FOR DELETE USING (auth.uid() = user_id);

-- Table for sales
CREATE TABLE IF NOT EXISTS public.sales (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sale_date timestamp with time zone DEFAULT now() NOT NULL,
  total_amount numeric(10, 2) NOT NULL,
  payment_method text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT sales_pkey PRIMARY KEY (id)
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales are visible to their owners." ON public.sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can insert sales." ON public.sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update sales." ON public.sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete sales." ON public.sales FOR DELETE USING (auth.uid() = user_id);

-- Table for sale items (details of each sale)
CREATE TABLE IF NOT EXISTS public.sale_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  sale_id uuid REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL,
  price_at_sale numeric(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT sale_items_pkey PRIMARY KEY (id)
);

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sale items are visible to their owners." ON public.sale_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));
CREATE POLICY "Owners can insert sale items." ON public.sale_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));
CREATE POLICY "Owners can update sale items." ON public.sale_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));
CREATE POLICY "Owners can delete sale items." ON public.sale_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));

-- Table for expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  expense_date timestamp with time zone DEFAULT now() NOT NULL,
  category text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT expenses_pkey PRIMARY KEY (id)
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Expenses are visible to their owners." ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can insert expenses." ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update expenses." ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete expenses." ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Table for cash register movements (arqueo de caja)
CREATE TABLE IF NOT EXISTS public.cash_register_movements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movement_type text NOT NULL, -- 'initial_balance', 'deposit', 'withdrawal', 'closing_balance'
  amount numeric(10, 2) NOT NULL,
  description text,
  movement_date timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT cash_register_movements_pkey PRIMARY KEY (id)
);

ALTER TABLE public.cash_register_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cash register movements are visible to their owners." ON public.cash_register_movements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can insert cash register movements." ON public.cash_register_movements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update cash register movements." ON public.cash_register_movements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete cash register movements." ON public.cash_register_movements FOR DELETE USING (auth.uid() = user_id);

-- Table for suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT suppliers_pkey PRIMARY KEY (id)
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suppliers are visible to their owners." ON public.suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can insert suppliers." ON public.suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update suppliers." ON public.suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete suppliers." ON public.suppliers FOR DELETE USING (auth.uid() = user_id);
