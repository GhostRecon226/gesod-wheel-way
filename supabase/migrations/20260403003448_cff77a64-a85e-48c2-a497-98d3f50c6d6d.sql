
-- Enums
CREATE TYPE public.app_role AS ENUM ('customer', 'admin');
CREATE TYPE public.bid_status AS ENUM ('pending', 'approved', 'rejected', 'won', 'lost');
CREATE TYPE public.quote_type AS ENUM ('ocean', 'inland');
CREATE TYPE public.quote_status AS ENUM ('pending', 'issued', 'accepted', 'expired');
CREATE TYPE public.auction_status AS ENUM ('active', 'expired');
CREATE TYPE public.currency_type AS ENUM ('USD', 'NGN');
CREATE TYPE public.payment_status AS ENUM ('pending', 'confirmed');
CREATE TYPE public.dispute_status AS ENUM ('open', 'under_review', 'resolved');
CREATE TYPE public.destination_port AS ENUM ('Apapa', 'Tin Can', 'Onne');
CREATE TYPE public.sailing_status AS ENUM ('scheduled', 'departed', 'arrived');

-- Users table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- User roles table (for secure admin checks without recursion)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Users RLS
CREATE POLICY "Customers can view own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- User roles RLS
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vin TEXT,
  make TEXT,
  model TEXT,
  year INTEGER,
  title_type TEXT,
  damage_description TEXT,
  odometer INTEGER,
  run_and_drive BOOLEAN DEFAULT false,
  status TEXT,
  customer_id UUID REFERENCES public.users(id),
  auction_source TEXT,
  lot_number TEXT,
  yard_location TEXT,
  auction_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own vehicles" ON public.vehicles
  FOR SELECT USING (auth.uid()::text = customer_id::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update vehicles" ON public.vehicles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete vehicles" ON public.vehicles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Vehicle milestones
CREATE TABLE public.vehicle_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  notes TEXT,
  evidence_url TEXT,
  updated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicle_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own vehicle milestones" ON public.vehicle_milestones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND auth.uid()::text = v.customer_id::text)
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Admins manage milestones" ON public.vehicle_milestones
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Bid requests
CREATE TABLE public.bid_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.users(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  max_bid NUMERIC,
  status bid_status NOT NULL DEFAULT 'pending',
  deposit_status TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.bid_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own bids" ON public.bid_requests
  FOR SELECT USING (auth.uid()::text = customer_id::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers create bids" ON public.bid_requests
  FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage bids" ON public.bid_requests
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete bids" ON public.bid_requests
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Quote requests
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.users(id),
  type quote_type NOT NULL,
  vehicle_details TEXT,
  status quote_status NOT NULL DEFAULT 'pending',
  amount_usd NUMERIC,
  amount_ngn NUMERIC,
  valid_until DATE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own quotes" ON public.quote_requests
  FOR SELECT USING (auth.uid()::text = customer_id::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers create quotes" ON public.quote_requests
  FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage quotes" ON public.quote_requests
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete quotes" ON public.quote_requests
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Auction listings
CREATE TABLE public.auction_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  make TEXT,
  model TEXT,
  year INTEGER,
  images TEXT[],
  lot_number TEXT,
  auction_source TEXT,
  auction_date DATE,
  yard_location TEXT,
  status auction_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.auction_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active listings" ON public.auction_listings
  FOR SELECT USING (true);
CREATE POLICY "Admins manage listings" ON public.auction_listings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Documents
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  type TEXT,
  file_url TEXT,
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own documents" ON public.documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND auth.uid()::text = v.customer_id::text)
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Authenticated users upload documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage documents" ON public.documents
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete documents" ON public.documents
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Payments
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id),
  customer_id UUID NOT NULL REFERENCES public.users(id),
  stage TEXT,
  amount NUMERIC NOT NULL,
  currency currency_type NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  confirmed_by UUID REFERENCES public.users(id),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own payments" ON public.payments
  FOR SELECT USING (auth.uid()::text = customer_id::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage payments" ON public.payments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Disputes
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id),
  customer_id UUID NOT NULL REFERENCES public.users(id),
  description TEXT NOT NULL,
  status dispute_status NOT NULL DEFAULT 'open',
  admin_response TEXT,
  evidence_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own disputes" ON public.disputes
  FOR SELECT USING (auth.uid()::text = customer_id::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers create disputes" ON public.disputes
  FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text);
CREATE POLICY "Admins manage disputes" ON public.disputes
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete disputes" ON public.disputes
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Sailing schedules
CREATE TABLE public.sailing_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_name TEXT NOT NULL,
  departure_port TEXT,
  etd DATE,
  eta_nigeria DATE,
  destination_port destination_port,
  status sailing_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.sailing_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view schedules" ON public.sailing_schedules
  FOR SELECT USING (true);
CREATE POLICY "Admins manage schedules" ON public.sailing_schedules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid()::text = user_id::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Admins manage notifications" ON public.notifications
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for vehicle documents
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-documents', 'vehicle-documents', false);

CREATE POLICY "Authenticated users can upload to vehicle-documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'vehicle-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view vehicle-documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'vehicle-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete from vehicle-documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'vehicle-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vehicle-documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'vehicle-documents' AND public.has_role(auth.uid(), 'admin'));
