-- 1. Fix search_path on remaining SECURITY DEFINER functions
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = pg_catalog, public, pgmq, pg_temp;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = pg_catalog, public, pgmq, pg_temp;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = pg_catalog, public, pgmq, pg_temp;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = pg_catalog, public, pgmq, pg_temp;

-- 2. Restrict EXECUTE on SECURITY DEFINER functions that clients must not call
-- (email_queue_dispatch/email_queue_wake are intentionally not referenced
-- here: they're created later by 20260825201648_email_queue_dispatch_and_cron.sql,
-- which grants their own permissions. Revoking them at this point in the
-- migration sequence would fail since they don't exist yet.)
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

-- 3. has_role must only be callable by signed-in users; scope all policies using it to authenticated
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- auction_listings
DROP POLICY IF EXISTS "Admins manage listings" ON public.auction_listings;
CREATE POLICY "Admins manage listings" ON public.auction_listings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- sailing_schedules
DROP POLICY IF EXISTS "Admins manage schedules" ON public.sailing_schedules;
CREATE POLICY "Admins manage schedules" ON public.sailing_schedules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- bid_requests
DROP POLICY IF EXISTS "Admins delete bids" ON public.bid_requests;
CREATE POLICY "Admins delete bids" ON public.bid_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage bids" ON public.bid_requests;
CREATE POLICY "Admins manage bids" ON public.bid_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Customers create bids" ON public.bid_requests;
CREATE POLICY "Customers create bids" ON public.bid_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Customers view own bids" ON public.bid_requests;
CREATE POLICY "Customers view own bids" ON public.bid_requests FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin'));

-- disputes
DROP POLICY IF EXISTS "Admins delete disputes" ON public.disputes;
CREATE POLICY "Admins delete disputes" ON public.disputes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage disputes" ON public.disputes;
CREATE POLICY "Admins manage disputes" ON public.disputes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Customers create disputes" ON public.disputes;
CREATE POLICY "Customers create disputes" ON public.disputes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Customers view own disputes" ON public.disputes;
CREATE POLICY "Customers view own disputes" ON public.disputes FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin'));

-- documents
DROP POLICY IF EXISTS "Admins delete documents" ON public.documents;
CREATE POLICY "Admins delete documents" ON public.documents FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage documents" ON public.documents;
CREATE POLICY "Admins manage documents" ON public.documents FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Customers view own documents" ON public.documents;
CREATE POLICY "Customers view own documents" ON public.documents FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = documents.vehicle_id AND v.customer_id = auth.uid()));

-- notifications
DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;
CREATE POLICY "Admins manage notifications" ON public.notifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
-- explicit insert guard: only admins may create notifications, never for spoofed users
DROP POLICY IF EXISTS "Only admins create notifications" ON public.notifications;
CREATE POLICY "Only admins create notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- payments
DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Customers view own payments" ON public.payments;
CREATE POLICY "Customers view own payments" ON public.payments FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin'));

-- quote_requests
DROP POLICY IF EXISTS "Admins delete quotes" ON public.quote_requests;
CREATE POLICY "Admins delete quotes" ON public.quote_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage quotes" ON public.quote_requests;
CREATE POLICY "Admins manage quotes" ON public.quote_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Customers create quotes" ON public.quote_requests;
CREATE POLICY "Customers create quotes" ON public.quote_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Customers view own quotes" ON public.quote_requests;
CREATE POLICY "Customers view own quotes" ON public.quote_requests FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin'));

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- users
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Customers can update own profile" ON public.users;
CREATE POLICY "Customers can update own profile" ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Customers can view own profile" ON public.users;
CREATE POLICY "Customers can view own profile" ON public.users FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- vehicle_milestones
DROP POLICY IF EXISTS "Admins manage milestones" ON public.vehicle_milestones;
CREATE POLICY "Admins manage milestones" ON public.vehicle_milestones FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Customers view own vehicle milestones" ON public.vehicle_milestones;
CREATE POLICY "Customers view own vehicle milestones" ON public.vehicle_milestones FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_milestones.vehicle_id AND v.customer_id = auth.uid()));

-- vehicles
DROP POLICY IF EXISTS "Admins can delete vehicles" ON public.vehicles;
CREATE POLICY "Admins can delete vehicles" ON public.vehicles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert vehicles" ON public.vehicles;
CREATE POLICY "Admins can insert vehicles" ON public.vehicles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update vehicles" ON public.vehicles;
CREATE POLICY "Admins can update vehicles" ON public.vehicles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Customers view own vehicles" ON public.vehicles;
CREATE POLICY "Customers view own vehicles" ON public.vehicles FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin'));

-- 4. Storage: ownership-scoped access to vehicle-documents
DROP POLICY IF EXISTS "Authenticated users can view vehicle-documents" ON storage.objects;
CREATE POLICY "Owners and admins can view vehicle-documents" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'vehicle-documents' AND (
      public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1 FROM public.documents d
        JOIN public.vehicles v ON v.id = d.vehicle_id
        WHERE v.customer_id = auth.uid()
          AND d.file_url LIKE '%' || storage.objects.name
      )
      OR (storage.foldername(storage.objects.name))[1] = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Authenticated users can upload to vehicle-documents" ON storage.objects;
CREATE POLICY "Owners and admins can upload vehicle-documents" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vehicle-documents' AND (
      public.has_role(auth.uid(), 'admin')
      OR (
        (storage.foldername(name))[1] = auth.uid()::text
        AND EXISTS (SELECT 1 FROM public.vehicles v WHERE v.customer_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Admins can delete from vehicle-documents" ON storage.objects;
CREATE POLICY "Admins can delete from vehicle-documents" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vehicle-documents' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update vehicle-documents" ON storage.objects;
CREATE POLICY "Admins can update vehicle-documents" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'vehicle-documents' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'vehicle-documents' AND public.has_role(auth.uid(), 'admin'));