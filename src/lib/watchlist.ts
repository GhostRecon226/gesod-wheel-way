import { supabase } from "@/integrations/supabase/client";

export interface WatchlistRow {
  id: string;
  listing_id: string;
  created_at: string;
}

export async function fetchWatchedListingIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("auction_watchlist")
    .select("listing_id")
    .eq("user_id", userId);
  return (data ?? []).map((r) => r.listing_id as string);
}

export async function addToWatchlist(userId: string, listingId: string) {
  return supabase
    .from("auction_watchlist")
    .insert({ user_id: userId, listing_id: listingId });
}

export async function removeFromWatchlist(userId: string, listingId: string) {
  return supabase
    .from("auction_watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("listing_id", listingId);
}
