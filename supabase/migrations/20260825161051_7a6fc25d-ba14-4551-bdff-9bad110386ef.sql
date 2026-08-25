DO $$
DECLARE v_id uuid;
BEGIN
  SELECT id INTO v_id FROM auth.users WHERE lower(email) = 'chibuzor_opara15@yahoo.com' LIMIT 1;

  IF v_id IS NULL THEN
    RAISE NOTICE 'No auth user found for chibuzor_opara15@yahoo.com; nothing granted.';
    RETURN;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.users SET role = 'admin' WHERE id = v_id;
END $$;