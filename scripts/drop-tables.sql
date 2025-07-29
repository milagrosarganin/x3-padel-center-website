DROP TABLE IF EXISTS public.cash_register_movements CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.sale_items CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;

-- Drop the trigger and function for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Drop product stock update triggers and functions
DROP TRIGGER IF EXISTS on_sale_item_insert ON public.sale_items CASCADE;
DROP FUNCTION IF EXISTS update_product_stock_on_sale CASCADE;
DROP TRIGGER IF EXISTS on_sale_item_delete ON public.sale_items CASCADE;
DROP FUNCTION IF EXISTS update_product_stock_on_sale_item_delete CASCADE;
DROP TRIGGER IF EXISTS on_sale_item_update ON public.sale_items CASCADE;
DROP FUNCTION IF EXISTS update_product_stock_on_sale_item_update CASCADE;

-- Drop other functions
DROP FUNCTION IF EXISTS get_business_name(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_full_name(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_total_sales(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_total_expenses(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_product_stock(uuid) CASCADE;
