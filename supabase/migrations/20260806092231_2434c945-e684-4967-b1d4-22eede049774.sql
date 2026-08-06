CREATE TABLE public.auction_watchlist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  listing_id uuid NOT NULL REFERENCES public.auction_listings(id) ON DELETE CASCADE,
  notified_start_at timestamp with time zone,
  notified_end_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.auction_watchlist TO authenticated;
GRANT ALL ON public.auction_watchlist TO service_role;

ALTER TABLE public.auction_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlist"
ON public.auction_watchlist FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can add to their own watchlist"
ON public.auction_watchlist FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist"
ON public.auction_watchlist FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own watchlist"
ON public.auction_watchlist FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_auction_watchlist_updated_at
BEFORE UPDATE ON public.auction_watchlist
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX auction_watchlist_listing_idx ON public.auction_watchlist(listing_id);