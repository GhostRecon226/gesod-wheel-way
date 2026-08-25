-- GESOD RIDES: consolidated database schema
-- Generated from the live database catalog. Apply to an EMPTY Supabase project.
--   psql "$DATABASE_URL" -f schema.sql
--
-- Scope: public schema only (types, tables, grants, RLS, policies, functions,
-- triggers) plus RLS policies on storage.objects. Does NOT include: rows/data,
-- auth.users, storage buckets (see storage.md), cron jobs, vault secrets, or
-- project auth settings (see MIGRATION.md).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =====================  ENUM TYPES  =====================

CREATE TYPE public.app_role AS ENUM ('customer', 'admin');
CREATE TYPE public.auction_status AS ENUM ('active', 'expired');
CREATE TYPE public.bid_status AS ENUM ('pending', 'approved', 'rejected', 'won', 'lost');
CREATE TYPE public.currency_type AS ENUM ('USD', 'NGN');
CREATE TYPE public.destination_port AS ENUM ('Apapa', 'Tin Can', 'Onne');
CREATE TYPE public.dispute_status AS ENUM ('open', 'under_review', 'resolved');
CREATE TYPE public.payment_status AS ENUM ('pending', 'confirmed');
CREATE TYPE public.quote_status AS ENUM ('pending', 'issued', 'accepted', 'expired');
CREATE TYPE public.quote_type AS ENUM ('ocean', 'inland');
CREATE TYPE public.sailing_status AS ENUM ('scheduled', 'departed', 'arrived');


-- =====================  TABLES  =====================

CREATE TABLE public.auction_listings (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "make" text,
  "model" text,
  "year" integer,
  "images" text[],
  "lot_number" text,
  "auction_source" text,
  "auction_date" date,
  "yard_location" text,
  "status" auction_status DEFAULT 'active'::auction_status NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "vin" text,
  "title_type" text,
  "odometer" integer,
  "primary_damage" text,
  "secondary_damage" text,
  "damage_description" text,
  "run_and_drive" boolean DEFAULT false,
  "has_keys" boolean DEFAULT false,
  "estimated_value" numeric,
  "body_style" text,
  "engine" text,
  "transmission" text,
  "drivetrain" text,
  "fuel_type" text,
  "exterior_color" text,
  "interior_color" text,
  CONSTRAINT auction_listings_pkey PRIMARY KEY (id)
);

CREATE TABLE public.auction_watchlist (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "listing_id" uuid NOT NULL,
  "notified_start_at" timestamp with time zone,
  "notified_end_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT auction_watchlist_pkey PRIMARY KEY (id),
  CONSTRAINT auction_watchlist_user_id_listing_id_key UNIQUE (user_id, listing_id)
);

CREATE TABLE public.bid_requests (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid NOT NULL,
  "vehicle_id" uuid,
  "max_bid" numeric,
  "status" bid_status DEFAULT 'pending'::bid_status NOT NULL,
  "deposit_status" text,
  "admin_notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT bid_requests_pkey PRIMARY KEY (id)
);

CREATE TABLE public.contact_messages (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "message" text NOT NULL,
  "read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);

CREATE TABLE public.disputes (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "vehicle_id" uuid,
  "customer_id" uuid NOT NULL,
  "description" text NOT NULL,
  "status" dispute_status DEFAULT 'open'::dispute_status NOT NULL,
  "admin_response" text,
  "evidence_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT disputes_pkey PRIMARY KEY (id)
);

CREATE TABLE public.documents (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "vehicle_id" uuid NOT NULL,
  "type" text,
  "file_url" text,
  "uploaded_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "review_status" text DEFAULT 'pending'::text NOT NULL,
  "review_notes" text,
  "reviewed_by" uuid,
  "reviewed_at" timestamp with time zone,
  CONSTRAINT documents_pkey PRIMARY KEY (id)
);

CREATE TABLE public.driver_payments (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "driver_id" uuid,
  "load_id" uuid,
  "amount" numeric,
  "method" text,
  "status" text DEFAULT 'pending'::text,
  "paid_date" date,
  "notes" text,
  CONSTRAINT driver_payments_pkey PRIMARY KEY (id),
  CONSTRAINT driver_payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text])))
);

CREATE TABLE public.drivers (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "phone" text,
  "email" text,
  "payment_method" text,
  "payment_details" text,
  "notes" text,
  "active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT drivers_pkey PRIMARY KEY (id),
  CONSTRAINT drivers_payment_method_check CHECK ((payment_method = ANY (ARRAY['zelle'::text, 'ach'::text, 'other'::text])))
);

CREATE TABLE public.email_send_log (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "message_id" text,
  "template_name" text NOT NULL,
  "recipient_email" text NOT NULL,
  "status" text NOT NULL,
  "error_message" text,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT email_send_log_pkey PRIMARY KEY (id),
  CONSTRAINT email_send_log_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'suppressed'::text, 'failed'::text, 'bounced'::text, 'complained'::text, 'dlq'::text])))
);

CREATE TABLE public.email_send_state (
  "id" integer DEFAULT 1 NOT NULL,
  "retry_after_until" timestamp with time zone,
  "batch_size" integer DEFAULT 10 NOT NULL,
  "send_delay_ms" integer DEFAULT 200 NOT NULL,
  "auth_email_ttl_minutes" integer DEFAULT 15 NOT NULL,
  "transactional_email_ttl_minutes" integer DEFAULT 60 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT email_send_state_pkey PRIMARY KEY (id),
  CONSTRAINT email_send_state_id_check CHECK ((id = 1))
);

CREATE TABLE public.email_unsubscribe_tokens (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "token" text NOT NULL,
  "email" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "used_at" timestamp with time zone,
  CONSTRAINT email_unsubscribe_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT email_unsubscribe_tokens_email_key UNIQUE (email),
  CONSTRAINT email_unsubscribe_tokens_token_key UNIQUE (token)
);

CREATE TABLE public.invoice_line_items (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "invoice_id" uuid,
  "load_id" uuid,
  "type" text,
  "description" text,
  "amount" numeric,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT invoice_line_items_pkey PRIMARY KEY (id),
  CONSTRAINT invoice_line_items_type_check CHECK ((type = ANY (ARRAY['base_price'::text, 'service_fee'::text, 'tire_change'::text, 'battery'::text, 'key_fix'::text, 'repair'::text, 'surcharge'::text, 'other'::text])))
);

CREATE TABLE public.invoice_loads (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "invoice_id" uuid,
  "load_id" uuid,
  CONSTRAINT invoice_loads_pkey PRIMARY KEY (id)
);

CREATE TABLE public.invoices (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid,
  "status" text DEFAULT 'draft'::text,
  "total_amount" numeric DEFAULT 0,
  "notes" text,
  "approved_by" uuid,
  "approved_at" timestamp with time zone,
  "sent_at" timestamp with time zone,
  "paid_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'sent'::text, 'paid'::text])))
);

CREATE TABLE public.load_status_history (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "load_id" uuid,
  "status" text,
  "notes" text,
  "updated_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT load_status_history_pkey PRIMARY KEY (id)
);

CREATE TABLE public.loads (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "vin" text NOT NULL,
  "lot_number" text,
  "buyer_number" text,
  "customer_id" uuid,
  "driver_id" uuid,
  "make" text,
  "model" text,
  "year" integer,
  "pickup_location" text,
  "destination_type" text,
  "destination_address" text,
  "agreed_pickup_price" numeric,
  "service_fee" numeric DEFAULT 50,
  "status" text DEFAULT 'posted'::text,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT loads_pkey PRIMARY KEY (id),
  CONSTRAINT loads_destination_type_check CHECK ((destination_type = ANY (ARRAY['port'::text, 'yard'::text, 'container'::text, 'residence'::text]))),
  CONSTRAINT loads_status_check CHECK ((status = ANY (ARRAY['posted'::text, 'driver_assigned'::text, 'picked_up'::text, 'in_transit'::text, 'delivered'::text, 'invoiced'::text, 'paid'::text])))
);

CREATE TABLE public.notifications (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "message" text NOT NULL,
  "read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

CREATE TABLE public.payments (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "vehicle_id" uuid,
  "customer_id" uuid NOT NULL,
  "stage" text,
  "amount" numeric NOT NULL,
  "currency" currency_type DEFAULT 'USD'::currency_type NOT NULL,
  "status" payment_status DEFAULT 'pending'::payment_status NOT NULL,
  "confirmed_by" uuid,
  "payment_date" timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id)
);

CREATE TABLE public.quote_requests (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid NOT NULL,
  "type" quote_type NOT NULL,
  "vehicle_details" text,
  "status" quote_status DEFAULT 'pending'::quote_status NOT NULL,
  "amount_usd" numeric,
  "amount_ngn" numeric,
  "valid_until" date,
  "admin_notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT quote_requests_pkey PRIMARY KEY (id)
);

CREATE TABLE public.sailing_schedules (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "vessel_name" text NOT NULL,
  "departure_port" text,
  "etd" date,
  "eta_nigeria" date,
  "destination_port" destination_port,
  "status" sailing_status DEFAULT 'scheduled'::sailing_status NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT sailing_schedules_pkey PRIMARY KEY (id)
);

CREATE TABLE public.suppressed_emails (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "reason" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT suppressed_emails_pkey PRIMARY KEY (id),
  CONSTRAINT suppressed_emails_email_key UNIQUE (email),
  CONSTRAINT suppressed_emails_reason_check CHECK ((reason = ANY (ARRAY['unsubscribe'::text, 'bounce'::text, 'complaint'::text])))
);

CREATE TABLE public.user_roles (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "role" app_role NOT NULL,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

CREATE TABLE public.users (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "role" app_role DEFAULT 'customer'::app_role NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email)
);

CREATE TABLE public.vehicle_milestones (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "vehicle_id" uuid NOT NULL,
  "stage" text NOT NULL,
  "notes" text,
  "evidence_url" text,
  "updated_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT vehicle_milestones_pkey PRIMARY KEY (id)
);

CREATE TABLE public.vehicles (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "vin" text,
  "make" text,
  "model" text,
  "year" integer,
  "title_type" text,
  "damage_description" text,
  "odometer" integer,
  "run_and_drive" boolean DEFAULT false,
  "status" text,
  "customer_id" uuid,
  "auction_source" text,
  "lot_number" text,
  "yard_location" text,
  "auction_date" date,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT vehicles_pkey PRIMARY KEY (id)
);


-- =====================  FOREIGN KEYS  =====================

ALTER TABLE public.auction_watchlist ADD CONSTRAINT auction_watchlist_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES auction_listings(id) ON DELETE CASCADE;
ALTER TABLE public.bid_requests ADD CONSTRAINT bid_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id);
ALTER TABLE public.bid_requests ADD CONSTRAINT bid_requests_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);
ALTER TABLE public.disputes ADD CONSTRAINT disputes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id);
ALTER TABLE public.disputes ADD CONSTRAINT disputes_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);
ALTER TABLE public.documents ADD CONSTRAINT documents_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES users(id);
ALTER TABLE public.documents ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users(id);
ALTER TABLE public.documents ADD CONSTRAINT documents_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;
ALTER TABLE public.driver_payments ADD CONSTRAINT driver_payments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES drivers(id);
ALTER TABLE public.driver_payments ADD CONSTRAINT driver_payments_load_id_fkey FOREIGN KEY (load_id) REFERENCES loads(id);
ALTER TABLE public.invoice_line_items ADD CONSTRAINT invoice_line_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id);
ALTER TABLE public.invoice_line_items ADD CONSTRAINT invoice_line_items_load_id_fkey FOREIGN KEY (load_id) REFERENCES loads(id);
ALTER TABLE public.invoice_loads ADD CONSTRAINT invoice_loads_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id);
ALTER TABLE public.invoice_loads ADD CONSTRAINT invoice_loads_load_id_fkey FOREIGN KEY (load_id) REFERENCES loads(id);
ALTER TABLE public.invoices ADD CONSTRAINT invoices_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id);
ALTER TABLE public.invoices ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id);
ALTER TABLE public.load_status_history ADD CONSTRAINT load_status_history_load_id_fkey FOREIGN KEY (load_id) REFERENCES loads(id);
ALTER TABLE public.load_status_history ADD CONSTRAINT load_status_history_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE public.loads ADD CONSTRAINT loads_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id);
ALTER TABLE public.loads ADD CONSTRAINT loads_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES drivers(id);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD CONSTRAINT payments_confirmed_by_fkey FOREIGN KEY (confirmed_by) REFERENCES users(id);
ALTER TABLE public.payments ADD CONSTRAINT payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id);
ALTER TABLE public.payments ADD CONSTRAINT payments_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);
ALTER TABLE public.quote_requests ADD CONSTRAINT quote_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.vehicle_milestones ADD CONSTRAINT vehicle_milestones_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE public.vehicle_milestones ADD CONSTRAINT vehicle_milestones_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;
ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id);


-- =====================  INDEXES  =====================

CREATE INDEX auction_watchlist_listing_idx ON public.auction_watchlist USING btree (listing_id);
CREATE INDEX contact_messages_created_at_idx ON public.contact_messages USING btree (created_at DESC);
CREATE INDEX driver_payments_driver_id_idx ON public.driver_payments USING btree (driver_id);
CREATE INDEX driver_payments_load_id_idx ON public.driver_payments USING btree (load_id);
CREATE INDEX idx_email_send_log_created ON public.email_send_log USING btree (created_at DESC);
CREATE INDEX idx_email_send_log_message ON public.email_send_log USING btree (message_id);
CREATE UNIQUE INDEX idx_email_send_log_message_sent_unique ON public.email_send_log USING btree (message_id) WHERE (status = 'sent'::text);
CREATE INDEX idx_email_send_log_recipient ON public.email_send_log USING btree (recipient_email);
CREATE INDEX idx_unsubscribe_tokens_token ON public.email_unsubscribe_tokens USING btree (token);
CREATE INDEX invoice_line_items_invoice_id_idx ON public.invoice_line_items USING btree (invoice_id);
CREATE INDEX invoice_line_items_load_id_idx ON public.invoice_line_items USING btree (load_id);
CREATE INDEX invoice_loads_invoice_id_idx ON public.invoice_loads USING btree (invoice_id);
CREATE INDEX invoice_loads_load_id_idx ON public.invoice_loads USING btree (load_id);
CREATE INDEX invoices_customer_id_idx ON public.invoices USING btree (customer_id);
CREATE INDEX load_status_history_load_id_idx ON public.load_status_history USING btree (load_id);
CREATE INDEX loads_customer_id_idx ON public.loads USING btree (customer_id);
CREATE INDEX loads_driver_id_idx ON public.loads USING btree (driver_id);
CREATE INDEX idx_suppressed_emails_email ON public.suppressed_emails USING btree (email);


-- =====================  GRANTS  =====================



-- =====================  ROW LEVEL SECURITY  =====================



-- =====================  POLICIES (public schema)  =====================

CREATE POLICY "Admins manage listings" ON public.auction_listings
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active listings" ON public.auction_listings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can add to their own watchlist" ON public.auction_watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can remove their own watchlist" ON public.auction_watchlist
  FOR DELETE
  TO authenticated
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can update their own watchlist" ON public.auction_watchlist
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view their own watchlist" ON public.auction_watchlist
  FOR SELECT
  TO authenticated
  USING (((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins delete bids" ON public.bid_requests
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage bids" ON public.bid_requests
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers create bids" ON public.bid_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (((auth.uid() = customer_id) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Customers view own bids" ON public.bid_requests
  FOR SELECT
  TO authenticated
  USING (((auth.uid() = customer_id) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins can update contact messages" ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view contact messages" ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit a contact message" ON public.contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins delete disputes" ON public.disputes
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage disputes" ON public.disputes
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers create disputes" ON public.disputes
  FOR INSERT
  TO authenticated
  WITH CHECK (((auth.uid() = customer_id) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Customers view own disputes" ON public.disputes
  FOR SELECT
  TO authenticated
  USING (((auth.uid() = customer_id) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins delete documents" ON public.documents
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage documents" ON public.documents
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers upload docs for own vehicles" ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK ((has_role(auth.uid(), 'admin'::app_role) OR ((uploaded_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM vehicles v
  WHERE ((v.id = documents.vehicle_id) AND (v.customer_id = auth.uid())))))));

CREATE POLICY "Customers view own documents" ON public.documents
  FOR SELECT
  TO authenticated
  USING ((has_role(auth.uid(), 'admin'::app_role) OR (EXISTS ( SELECT 1
   FROM vehicles v
  WHERE ((v.id = documents.vehicle_id) AND (v.customer_id = auth.uid()))))));

CREATE POLICY "Admins manage driver payments" ON public.driver_payments
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage drivers" ON public.drivers
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert send log" ON public.email_send_log
  FOR INSERT
  TO public
  WITH CHECK ((auth.role() = 'service_role'::text));

CREATE POLICY "Service role can read send log" ON public.email_send_log
  FOR SELECT
  TO public
  USING ((auth.role() = 'service_role'::text));

CREATE POLICY "Service role can update send log" ON public.email_send_log
  FOR UPDATE
  TO public
  USING ((auth.role() = 'service_role'::text))
  WITH CHECK ((auth.role() = 'service_role'::text));

CREATE POLICY "Service role can manage send state" ON public.email_send_state
  FOR ALL
  TO public
  USING ((auth.role() = 'service_role'::text))
  WITH CHECK ((auth.role() = 'service_role'::text));

CREATE POLICY "Service role can insert tokens" ON public.email_unsubscribe_tokens
  FOR INSERT
  TO public
  WITH CHECK ((auth.role() = 'service_role'::text));

CREATE POLICY "Service role can mark tokens as used" ON public.email_unsubscribe_tokens
  FOR UPDATE
  TO public
  USING ((auth.role() = 'service_role'::text))
  WITH CHECK ((auth.role() = 'service_role'::text));

CREATE POLICY "Service role can read tokens" ON public.email_unsubscribe_tokens
  FOR SELECT
  TO public
  USING ((auth.role() = 'service_role'::text));

CREATE POLICY "Admins manage invoice line items" ON public.invoice_line_items
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers view own invoice line items" ON public.invoice_line_items
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM invoices i
  WHERE ((i.id = invoice_line_items.invoice_id) AND (i.customer_id = auth.uid())))));

CREATE POLICY "Admins manage invoice loads" ON public.invoice_loads
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage invoices" ON public.invoices
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers view own invoices" ON public.invoices
  FOR SELECT
  TO authenticated
  USING ((customer_id = auth.uid()));

CREATE POLICY "Admins manage load status history" ON public.load_status_history
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers view own load status history" ON public.load_status_history
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM loads l
  WHERE ((l.id = load_status_history.load_id) AND (l.customer_id = auth.uid())))));

CREATE POLICY "Admins manage loads" ON public.loads
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers view own loads" ON public.loads
  FOR SELECT
  TO authenticated
  USING ((customer_id = auth.uid()));

CREATE POLICY "Admins manage notifications" ON public.notifications
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins create notifications" ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT
  TO authenticated
  USING (((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins manage payments" ON public.payments
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers view own payments" ON public.payments
  FOR SELECT
  TO authenticated
  USING (((auth.uid() = customer_id) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins delete quotes" ON public.quote_requests
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage quotes" ON public.quote_requests
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers create quotes" ON public.quote_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (((auth.uid() = customer_id) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Customers view own quotes" ON public.quote_requests
  FOR SELECT
  TO authenticated
  USING (((auth.uid() = customer_id) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins manage schedules" ON public.sailing_schedules
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view schedules" ON public.sailing_schedules
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can insert suppressed emails" ON public.suppressed_emails
  FOR INSERT
  TO public
  WITH CHECK ((auth.role() = 'service_role'::text));

CREATE POLICY "Service role can read suppressed emails" ON public.suppressed_emails
  FOR SELECT
  TO public
  USING ((auth.role() = 'service_role'::text));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id));

CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers can update own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = id))
  WITH CHECK (((auth.uid() = id) AND (role = 'customer'::app_role)));

CREATE POLICY "Customers can view own profile" ON public.users
  FOR SELECT
  TO authenticated
  USING (((auth.uid() = id) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (((auth.uid() = id) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins manage milestones" ON public.vehicle_milestones
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers view own vehicle milestones" ON public.vehicle_milestones
  FOR SELECT
  TO authenticated
  USING ((has_role(auth.uid(), 'admin'::app_role) OR (EXISTS ( SELECT 1
   FROM vehicles v
  WHERE ((v.id = vehicle_milestones.vehicle_id) AND (v.customer_id = auth.uid()))))));

CREATE POLICY "Admins can delete vehicles" ON public.vehicles
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert vehicles" ON public.vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update vehicles" ON public.vehicles
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers view own vehicles" ON public.vehicles
  FOR SELECT
  TO authenticated
  USING (((auth.uid() = customer_id) OR has_role(auth.uid(), 'admin'::app_role)));


-- =====================  FUNCTIONS  =====================

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'pgmq', 'pg_temp'
AS $function$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.email_queue_dispatch()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pgmq.q_auth_emails)
     AND NOT EXISTS (SELECT 1 FROM pgmq.q_transactional_emails) THEN
    BEGIN
      -- Serialize disarm against email_queue_wake on a shared advisory lock, then
      -- re-read under it: an enqueue racing the unschedule either committed (we
      -- see its row and leave the cron) or waits and re-arms after we commit.
      PERFORM pg_catalog.pg_advisory_xact_lock(7700000000000001);
      IF EXISTS (SELECT 1 FROM pgmq.q_auth_emails)
         OR EXISTS (SELECT 1 FROM pgmq.q_transactional_emails) THEN
        RETURN;
      END IF;
      PERFORM cron.unschedule('process-email-queue');
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'email_queue_dispatch: cron unschedule failed: %', SQLERRM;
    END;
    RETURN;
  END IF;

  IF (SELECT retry_after_until FROM public.email_send_state WHERE id = 1) > now() THEN
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := 'https://kykwfvvuksqsotztwoxx.supabase.co/functions/v1/process-email-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Lovable-Context', 'cron',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key'
      )
    ),
    body := '{}'::jsonb
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.email_queue_wake()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Runs inside the enqueue transaction; the outer handler guarantees nothing
  -- below can roll back the customer's email. Shared advisory lock serializes
  -- arming against email_queue_dispatch's disarm.
  PERFORM pg_catalog.pg_advisory_xact_lock(7700000000000001);
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-email-queue') THEN
    BEGIN
      PERFORM cron.schedule('process-email-queue', '5 seconds', $cron$ SELECT public.email_queue_dispatch(); $cron$);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'email_queue_wake: cron schedule failed: %', SQLERRM;
    END;
  END IF;

  BEGIN
    PERFORM net.http_post(
      url := 'https://kykwfvvuksqsotztwoxx.supabase.co/functions/v1/process-email-queue',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Lovable-Context', 'cron',
        'Authorization', 'Bearer ' || (
          SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key'
        )
      ),
      body := '{}'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'email_queue_wake failed (enqueue preserved): %', SQLERRM;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'pgmq', 'pg_temp'
AS $function$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Customer'))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'pgmq', 'pg_temp'
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
 RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'pgmq', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.track_vehicle_by_vin(_vin text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_norm text;
  v_rec  record;
  v_ms   jsonb;
BEGIN
  v_norm := upper(regexp_replace(coalesce(_vin, ''), '\s', '', 'g'));

  -- Require a full VIN so records cannot be enumerated or guessed.
  IF length(v_norm) <> 17 THEN
    RETURN NULL;
  END IF;

  SELECT v.id, v.make, v.model, v.year, v.vin, v.status
    INTO v_rec
  FROM public.vehicles v
  WHERE upper(v.vin) = v_norm
  LIMIT 1;

  IF v_rec.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT coalesce(
           jsonb_agg(
             jsonb_build_object(
               'id', m.id,
               'stage', m.stage,
               'notes', m.notes,
               'created_at', m.created_at,
               'evidence_url', m.evidence_url
             )
             ORDER BY m.created_at ASC
           ),
           '[]'::jsonb
         )
    INTO v_ms
  FROM public.vehicle_milestones m
  WHERE m.vehicle_id = v_rec.id;

  RETURN jsonb_build_object(
    'make', v_rec.make,
    'model', v_rec.model,
    'year', v_rec.year,
    'status', v_rec.status,
    -- Masked VIN only: first 4 + last 4 characters are ever exposed.
    'vin_masked', left(v_rec.vin, 4) || repeat('*', greatest(length(v_rec.vin) - 8, 0)) || right(v_rec.vin, 4),
    'milestones', v_ms
  );
END;
$function$;


-- =====================  TRIGGERS (public schema)  =====================

CREATE TRIGGER update_auction_watchlist_updated_at BEFORE UPDATE ON public.auction_watchlist FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =====================  AUTH TRIGGER  =====================
-- Creates the public.users row + default 'customer' role on signup.
-- Must be created by a role that owns/can trigger on auth.users
-- (run as the postgres/supabase_admin role).
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =====================  STORAGE POLICIES (storage.objects)  =====================
-- Create the buckets first (see storage.md), then apply these.

CREATE POLICY "Admins can delete auction images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (((bucket_id = 'auction-images'::text) AND has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins can delete from vehicle-documents" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (((bucket_id = 'vehicle-documents'::text) AND has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins can update auction images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (((bucket_id = 'auction-images'::text) AND has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins can update vehicle-documents" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (((bucket_id = 'vehicle-documents'::text) AND has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (((bucket_id = 'vehicle-documents'::text) AND has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins can upload auction images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (((bucket_id = 'auction-images'::text) AND has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Anyone can view auction images" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING ((bucket_id = 'auction-images'::text));

CREATE POLICY "Owners and admins can upload vehicle-documents" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (((bucket_id = 'vehicle-documents'::text) AND (has_role(auth.uid(), 'admin'::app_role) OR (((storage.foldername(name))[1] = (auth.uid())::text) AND (EXISTS ( SELECT 1
   FROM vehicles v
  WHERE (v.customer_id = auth.uid())))))));

CREATE POLICY "Owners and admins can view vehicle-documents" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (((bucket_id = 'vehicle-documents'::text) AND (has_role(auth.uid(), 'admin'::app_role) OR (EXISTS ( SELECT 1
   FROM (documents d
     JOIN vehicles v ON ((v.id = d.vehicle_id)))
  WHERE ((v.customer_id = auth.uid()) AND (d.file_url ~~ ('%'::text || objects.name))))) OR ((storage.foldername(name))[1] = (auth.uid())::text))));


COMMIT;
