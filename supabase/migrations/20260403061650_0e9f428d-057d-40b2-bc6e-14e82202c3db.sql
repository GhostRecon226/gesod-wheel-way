
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Customer'));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth users missing from public.users
INSERT INTO public.users (id, email, name)
SELECT au.id, au.email, COALESCE(au.raw_user_meta_data->>'name', 'Customer')
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- Backfill existing auth users missing from user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'customer'::app_role
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id)
ON CONFLICT (user_id, role) DO NOTHING;
