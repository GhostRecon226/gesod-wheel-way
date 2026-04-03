
DROP POLICY "Admins can insert users" ON public.users;

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid()::text = id::text
    OR public.has_role(auth.uid(), 'admin')
  );
