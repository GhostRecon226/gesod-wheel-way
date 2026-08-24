-- The existing "Customers can update own profile" UPDATE policy covers both
-- the owner and admin cases with a single USING clause and no WITH CHECK, so
-- Postgres reuses USING for the check — a customer could set their own
-- users.role to 'admin'. Split into two policies so the customer path can
-- carry a WITH CHECK that pins role to 'customer', without also restricting
-- admins (who need to manage any user's row, including its role).
DROP POLICY "Customers can update own profile" ON public.users;

CREATE POLICY "Customers can update own profile"
ON public.users FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = 'customer'::app_role);

CREATE POLICY "Admins can update any user"
ON public.users FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
