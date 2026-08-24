drop extension if exists "pg_cron";

drop extension if exists "pg_net";

drop extension if exists "pgmq";

create type "public"."account_status" as enum ('active', 'suspended');

create type "public"."auction_source" as enum ('copart', 'iaai', 'other');

create type "public"."auction_vehicle_status" as enum ('active', 'expired');

create type "public"."bid_request_status" as enum ('pending', 'approved', 'rejected', 'won', 'lost');

create type "public"."document_type" as enum ('invoice', 'bill_of_lading', 'photo', 'other');

create type "public"."ticket_category" as enum ('general', 'shipping', 'documents', 'billing', 'other');

create type "public"."ticket_priority" as enum ('low', 'medium', 'high', 'urgent');

create type "public"."ticket_status" as enum ('open', 'in_progress', 'awaiting_customer', 'resolved', 'closed');

create type "public"."vehicle_source" as enum ('auction', 'direct');

create type "public"."vehicle_type" as enum ('car', 'suv', 'truck');

create type "public"."vin_status" as enum ('pending', 'active', 'awaiting_action', 'in_progress', 'delayed', 'completed', 'cancelled', 'Pending', 'Active', 'Awaiting Action', 'In Progress', 'Delayed', 'Completed', 'Cancelled');

drop trigger if exists "update_auction_watchlist_updated_at" on "public"."auction_watchlist";

drop policy "Admins manage listings" on "public"."auction_listings";

drop policy "Anyone can view active listings" on "public"."auction_listings";

drop policy "Users can add to their own watchlist" on "public"."auction_watchlist";

drop policy "Users can remove their own watchlist" on "public"."auction_watchlist";

drop policy "Users can update their own watchlist" on "public"."auction_watchlist";

drop policy "Users can view their own watchlist" on "public"."auction_watchlist";

drop policy "Admins delete bids" on "public"."bid_requests";

drop policy "Admins manage bids" on "public"."bid_requests";

drop policy "Customers create bids" on "public"."bid_requests";

drop policy "Customers view own bids" on "public"."bid_requests";

drop policy "Admins can update contact messages" on "public"."contact_messages";

drop policy "Admins can view contact messages" on "public"."contact_messages";

drop policy "Anyone can submit a contact message" on "public"."contact_messages";

drop policy "Admins delete disputes" on "public"."disputes";

drop policy "Admins manage disputes" on "public"."disputes";

drop policy "Customers create disputes" on "public"."disputes";

drop policy "Customers view own disputes" on "public"."disputes";

drop policy "Admins delete documents" on "public"."documents";

drop policy "Admins manage documents" on "public"."documents";

drop policy "Customers upload docs for own vehicles" on "public"."documents";

drop policy "Customers view own documents" on "public"."documents";

drop policy "Service role can insert send log" on "public"."email_send_log";

drop policy "Service role can read send log" on "public"."email_send_log";

drop policy "Service role can update send log" on "public"."email_send_log";

drop policy "Service role can manage send state" on "public"."email_send_state";

drop policy "Service role can insert tokens" on "public"."email_unsubscribe_tokens";

drop policy "Service role can mark tokens as used" on "public"."email_unsubscribe_tokens";

drop policy "Service role can read tokens" on "public"."email_unsubscribe_tokens";

drop policy "Admins manage notifications" on "public"."notifications";

drop policy "Only admins create notifications" on "public"."notifications";

drop policy "Users update own notifications" on "public"."notifications";

drop policy "Users view own notifications" on "public"."notifications";

drop policy "Admins manage payments" on "public"."payments";

drop policy "Customers view own payments" on "public"."payments";

drop policy "Admins delete quotes" on "public"."quote_requests";

drop policy "Admins manage quotes" on "public"."quote_requests";

drop policy "Customers create quotes" on "public"."quote_requests";

drop policy "Customers view own quotes" on "public"."quote_requests";

drop policy "Admins manage schedules" on "public"."sailing_schedules";

drop policy "Anyone can view schedules" on "public"."sailing_schedules";

drop policy "Service role can insert suppressed emails" on "public"."suppressed_emails";

drop policy "Service role can read suppressed emails" on "public"."suppressed_emails";

drop policy "Admins can manage roles" on "public"."user_roles";

drop policy "Users can view own roles" on "public"."user_roles";

drop policy "Admins can delete users" on "public"."users";

drop policy "Customers can update own profile" on "public"."users";

drop policy "Customers can view own profile" on "public"."users";

drop policy "Users can insert own profile" on "public"."users";

drop policy "Admins manage milestones" on "public"."vehicle_milestones";

drop policy "Customers view own vehicle milestones" on "public"."vehicle_milestones";

drop policy "Admins can insert vehicles" on "public"."vehicles";

drop policy "Customers view own vehicles" on "public"."vehicles";

drop policy "Admins can delete vehicles" on "public"."vehicles";

drop policy "Admins can update vehicles" on "public"."vehicles";

revoke references on table "public"."auction_listings" from "anon";

revoke trigger on table "public"."auction_listings" from "anon";

revoke truncate on table "public"."auction_listings" from "anon";

revoke references on table "public"."auction_listings" from "authenticated";

revoke trigger on table "public"."auction_listings" from "authenticated";

revoke truncate on table "public"."auction_listings" from "authenticated";

revoke references on table "public"."auction_listings" from "service_role";

revoke trigger on table "public"."auction_listings" from "service_role";

revoke truncate on table "public"."auction_listings" from "service_role";

revoke references on table "public"."auction_watchlist" from "anon";

revoke trigger on table "public"."auction_watchlist" from "anon";

revoke truncate on table "public"."auction_watchlist" from "anon";

revoke delete on table "public"."auction_watchlist" from "authenticated";

revoke insert on table "public"."auction_watchlist" from "authenticated";

revoke references on table "public"."auction_watchlist" from "authenticated";

revoke select on table "public"."auction_watchlist" from "authenticated";

revoke trigger on table "public"."auction_watchlist" from "authenticated";

revoke truncate on table "public"."auction_watchlist" from "authenticated";

revoke update on table "public"."auction_watchlist" from "authenticated";

revoke delete on table "public"."auction_watchlist" from "service_role";

revoke insert on table "public"."auction_watchlist" from "service_role";

revoke references on table "public"."auction_watchlist" from "service_role";

revoke select on table "public"."auction_watchlist" from "service_role";

revoke trigger on table "public"."auction_watchlist" from "service_role";

revoke truncate on table "public"."auction_watchlist" from "service_role";

revoke update on table "public"."auction_watchlist" from "service_role";

revoke insert on table "public"."contact_messages" from "anon";

revoke references on table "public"."contact_messages" from "anon";

revoke trigger on table "public"."contact_messages" from "anon";

revoke truncate on table "public"."contact_messages" from "anon";

revoke insert on table "public"."contact_messages" from "authenticated";

revoke references on table "public"."contact_messages" from "authenticated";

revoke select on table "public"."contact_messages" from "authenticated";

revoke trigger on table "public"."contact_messages" from "authenticated";

revoke truncate on table "public"."contact_messages" from "authenticated";

revoke update on table "public"."contact_messages" from "authenticated";

revoke delete on table "public"."contact_messages" from "service_role";

revoke insert on table "public"."contact_messages" from "service_role";

revoke references on table "public"."contact_messages" from "service_role";

revoke select on table "public"."contact_messages" from "service_role";

revoke trigger on table "public"."contact_messages" from "service_role";

revoke truncate on table "public"."contact_messages" from "service_role";

revoke update on table "public"."contact_messages" from "service_role";

revoke references on table "public"."disputes" from "anon";

revoke trigger on table "public"."disputes" from "anon";

revoke truncate on table "public"."disputes" from "anon";

revoke references on table "public"."disputes" from "authenticated";

revoke trigger on table "public"."disputes" from "authenticated";

revoke truncate on table "public"."disputes" from "authenticated";

revoke references on table "public"."disputes" from "service_role";

revoke trigger on table "public"."disputes" from "service_role";

revoke truncate on table "public"."disputes" from "service_role";

revoke references on table "public"."email_send_log" from "anon";

revoke trigger on table "public"."email_send_log" from "anon";

revoke truncate on table "public"."email_send_log" from "anon";

revoke references on table "public"."email_send_log" from "authenticated";

revoke trigger on table "public"."email_send_log" from "authenticated";

revoke truncate on table "public"."email_send_log" from "authenticated";

revoke references on table "public"."email_send_log" from "service_role";

revoke trigger on table "public"."email_send_log" from "service_role";

revoke truncate on table "public"."email_send_log" from "service_role";

revoke references on table "public"."email_send_state" from "anon";

revoke trigger on table "public"."email_send_state" from "anon";

revoke truncate on table "public"."email_send_state" from "anon";

revoke references on table "public"."email_send_state" from "authenticated";

revoke trigger on table "public"."email_send_state" from "authenticated";

revoke truncate on table "public"."email_send_state" from "authenticated";

revoke references on table "public"."email_send_state" from "service_role";

revoke trigger on table "public"."email_send_state" from "service_role";

revoke truncate on table "public"."email_send_state" from "service_role";

revoke references on table "public"."email_unsubscribe_tokens" from "anon";

revoke trigger on table "public"."email_unsubscribe_tokens" from "anon";

revoke truncate on table "public"."email_unsubscribe_tokens" from "anon";

revoke references on table "public"."email_unsubscribe_tokens" from "authenticated";

revoke trigger on table "public"."email_unsubscribe_tokens" from "authenticated";

revoke truncate on table "public"."email_unsubscribe_tokens" from "authenticated";

revoke references on table "public"."email_unsubscribe_tokens" from "service_role";

revoke trigger on table "public"."email_unsubscribe_tokens" from "service_role";

revoke truncate on table "public"."email_unsubscribe_tokens" from "service_role";

revoke references on table "public"."payments" from "anon";

revoke trigger on table "public"."payments" from "anon";

revoke truncate on table "public"."payments" from "anon";

revoke references on table "public"."payments" from "authenticated";

revoke trigger on table "public"."payments" from "authenticated";

revoke truncate on table "public"."payments" from "authenticated";

revoke references on table "public"."payments" from "service_role";

revoke trigger on table "public"."payments" from "service_role";

revoke truncate on table "public"."payments" from "service_role";

revoke references on table "public"."sailing_schedules" from "anon";

revoke trigger on table "public"."sailing_schedules" from "anon";

revoke truncate on table "public"."sailing_schedules" from "anon";

revoke references on table "public"."sailing_schedules" from "authenticated";

revoke trigger on table "public"."sailing_schedules" from "authenticated";

revoke truncate on table "public"."sailing_schedules" from "authenticated";

revoke references on table "public"."sailing_schedules" from "service_role";

revoke trigger on table "public"."sailing_schedules" from "service_role";

revoke truncate on table "public"."sailing_schedules" from "service_role";

revoke references on table "public"."suppressed_emails" from "anon";

revoke trigger on table "public"."suppressed_emails" from "anon";

revoke truncate on table "public"."suppressed_emails" from "anon";

revoke references on table "public"."suppressed_emails" from "authenticated";

revoke trigger on table "public"."suppressed_emails" from "authenticated";

revoke truncate on table "public"."suppressed_emails" from "authenticated";

revoke references on table "public"."suppressed_emails" from "service_role";

revoke trigger on table "public"."suppressed_emails" from "service_role";

revoke truncate on table "public"."suppressed_emails" from "service_role";

revoke references on table "public"."users" from "anon";

revoke trigger on table "public"."users" from "anon";

revoke truncate on table "public"."users" from "anon";

revoke references on table "public"."users" from "authenticated";

revoke trigger on table "public"."users" from "authenticated";

revoke truncate on table "public"."users" from "authenticated";

revoke references on table "public"."users" from "service_role";

revoke trigger on table "public"."users" from "service_role";

revoke truncate on table "public"."users" from "service_role";

revoke references on table "public"."vehicle_milestones" from "anon";

revoke trigger on table "public"."vehicle_milestones" from "anon";

revoke truncate on table "public"."vehicle_milestones" from "anon";

revoke references on table "public"."vehicle_milestones" from "authenticated";

revoke trigger on table "public"."vehicle_milestones" from "authenticated";

revoke truncate on table "public"."vehicle_milestones" from "authenticated";

revoke references on table "public"."vehicle_milestones" from "service_role";

revoke trigger on table "public"."vehicle_milestones" from "service_role";

revoke truncate on table "public"."vehicle_milestones" from "service_role";

alter table "public"."auction_watchlist" drop constraint "auction_watchlist_listing_id_fkey";

alter table "public"."auction_watchlist" drop constraint "auction_watchlist_user_id_listing_id_key";

alter table "public"."bid_requests" drop constraint "bid_requests_vehicle_id_fkey";

alter table "public"."disputes" drop constraint "disputes_customer_id_fkey";

alter table "public"."disputes" drop constraint "disputes_vehicle_id_fkey";

alter table "public"."documents" drop constraint "documents_reviewed_by_fkey";

alter table "public"."documents" drop constraint "documents_uploaded_by_fkey";

alter table "public"."documents" drop constraint "documents_vehicle_id_fkey";

alter table "public"."email_send_log" drop constraint "email_send_log_status_check";

alter table "public"."email_send_state" drop constraint "email_send_state_id_check";

alter table "public"."email_unsubscribe_tokens" drop constraint "email_unsubscribe_tokens_email_key";

alter table "public"."email_unsubscribe_tokens" drop constraint "email_unsubscribe_tokens_token_key";

alter table "public"."notifications" drop constraint "notifications_user_id_fkey";

alter table "public"."payments" drop constraint "payments_confirmed_by_fkey";

alter table "public"."payments" drop constraint "payments_customer_id_fkey";

alter table "public"."payments" drop constraint "payments_vehicle_id_fkey";

alter table "public"."suppressed_emails" drop constraint "suppressed_emails_email_key";

alter table "public"."suppressed_emails" drop constraint "suppressed_emails_reason_check";

alter table "public"."users" drop constraint "users_email_key";

alter table "public"."vehicle_milestones" drop constraint "vehicle_milestones_updated_by_fkey";

alter table "public"."vehicle_milestones" drop constraint "vehicle_milestones_vehicle_id_fkey";

alter table "public"."bid_requests" drop constraint "bid_requests_customer_id_fkey";

alter table "public"."quote_requests" drop constraint "quote_requests_customer_id_fkey";

alter table "public"."vehicles" drop constraint "vehicles_customer_id_fkey";

drop function if exists "public"."delete_email"(queue_name text, message_id bigint);

drop function if exists "public"."email_queue_dispatch"();

drop function if exists "public"."email_queue_wake"();

drop function if exists "public"."enqueue_email"(queue_name text, payload jsonb);

drop function if exists "public"."has_role"(_user_id uuid, _role app_role);

drop function if exists "public"."move_to_dlq"(source_queue text, dlq_name text, message_id bigint, payload jsonb);

drop function if exists "public"."read_email_batch"(queue_name text, batch_size integer, vt integer);

drop function if exists "public"."set_updated_at"();

drop function if exists "public"."track_vehicle_by_vin"(_vin text);

alter table "public"."auction_listings" drop constraint "auction_listings_pkey";

alter table "public"."auction_watchlist" drop constraint "auction_watchlist_pkey";

alter table "public"."contact_messages" drop constraint "contact_messages_pkey";

alter table "public"."disputes" drop constraint "disputes_pkey";

alter table "public"."email_send_log" drop constraint "email_send_log_pkey";

alter table "public"."email_send_state" drop constraint "email_send_state_pkey";

alter table "public"."email_unsubscribe_tokens" drop constraint "email_unsubscribe_tokens_pkey";

alter table "public"."payments" drop constraint "payments_pkey";

alter table "public"."sailing_schedules" drop constraint "sailing_schedules_pkey";

alter table "public"."suppressed_emails" drop constraint "suppressed_emails_pkey";

alter table "public"."users" drop constraint "users_pkey";

alter table "public"."vehicle_milestones" drop constraint "vehicle_milestones_pkey";

drop index if exists "public"."auction_listings_pkey";

drop index if exists "public"."auction_watchlist_listing_idx";

drop index if exists "public"."auction_watchlist_pkey";

drop index if exists "public"."auction_watchlist_user_id_listing_id_key";

drop index if exists "public"."contact_messages_created_at_idx";

drop index if exists "public"."contact_messages_pkey";

drop index if exists "public"."disputes_pkey";

drop index if exists "public"."email_send_log_pkey";

drop index if exists "public"."email_send_state_pkey";

drop index if exists "public"."email_unsubscribe_tokens_email_key";

drop index if exists "public"."email_unsubscribe_tokens_pkey";

drop index if exists "public"."email_unsubscribe_tokens_token_key";

drop index if exists "public"."idx_email_send_log_created";

drop index if exists "public"."idx_email_send_log_message";

drop index if exists "public"."idx_email_send_log_message_sent_unique";

drop index if exists "public"."idx_email_send_log_recipient";

drop index if exists "public"."idx_suppressed_emails_email";

drop index if exists "public"."idx_unsubscribe_tokens_token";

drop index if exists "public"."payments_pkey";

drop index if exists "public"."sailing_schedules_pkey";

drop index if exists "public"."suppressed_emails_email_key";

drop index if exists "public"."suppressed_emails_pkey";

drop index if exists "public"."users_email_key";

drop index if exists "public"."users_pkey";

drop index if exists "public"."vehicle_milestones_pkey";

drop table "public"."auction_listings";

drop table "public"."auction_watchlist";

drop table "public"."contact_messages";

drop table "public"."disputes";

drop table "public"."email_send_log";

drop table "public"."email_send_state";

drop table "public"."email_unsubscribe_tokens";

drop table "public"."payments";

drop table "public"."sailing_schedules";

drop table "public"."suppressed_emails";

drop table "public"."users";

drop table "public"."vehicle_milestones";

alter type "public"."app_role" rename to "app_role__old_version_to_be_dropped";

create type "public"."app_role" as enum ('admin', 'customer');

alter type "public"."quote_status" rename to "quote_status__old_version_to_be_dropped";

create type "public"."quote_status" as enum ('pending', 'issued', 'expired', 'accepted');

alter type "public"."quote_type" rename to "quote_type__old_version_to_be_dropped";

create type "public"."quote_type" as enum ('ocean_freight', 'inland_freight');


  create table "public"."admin_notifications" (
    "id" uuid not null default gen_random_uuid(),
    "type" text not null,
    "title" text not null,
    "message" text not null,
    "related_id" uuid,
    "related_type" text,
    "is_read" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."admin_notifications" enable row level security;


  create table "public"."app_settings" (
    "id" uuid not null default gen_random_uuid(),
    "key" text not null,
    "value" jsonb not null default 'false'::jsonb,
    "updated_at" timestamp with time zone not null default now(),
    "updated_by" uuid
      );


alter table "public"."app_settings" enable row level security;


  create table "public"."auction_vehicles" (
    "id" uuid not null default gen_random_uuid(),
    "make" text not null,
    "model" text not null,
    "year" integer not null,
    "vehicle_type" public.vehicle_type not null,
    "auction_source" public.auction_source not null,
    "lot_number" text not null,
    "auction_date" date,
    "yard_location" text,
    "vehicle_images" text[] default '{}'::text[],
    "status" public.auction_vehicle_status not null default 'active'::public.auction_vehicle_status,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "remarks" text
      );


alter table "public"."auction_vehicles" enable row level security;


  create table "public"."customers" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "full_name" text not null,
    "email" text not null,
    "phone" text,
    "country" text,
    "account_status" public.account_status not null default 'active'::public.account_status,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."customers" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "email" text not null,
    "full_name" text,
    "phone" text,
    "company_name" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."public_quote_requests" (
    "id" uuid not null default gen_random_uuid(),
    "quote_type" public.quote_type not null,
    "vehicle_details" text not null,
    "origin_location" text not null,
    "destination_location" text not null,
    "contact_name" text not null,
    "contact_email" text not null,
    "contact_phone" text not null,
    "quote_status" public.quote_status not null default 'pending'::public.quote_status,
    "admin_notes" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "customer_id" uuid,
    "quote_amount" numeric,
    "currency" text default 'USD'::text,
    "valid_until" date
      );


alter table "public"."public_quote_requests" enable row level security;


  create table "public"."support_tickets" (
    "id" uuid not null default gen_random_uuid(),
    "customer_id" uuid not null,
    "subject" text not null,
    "description" text not null,
    "priority" public.ticket_priority not null default 'medium'::public.ticket_priority,
    "status" public.ticket_status not null default 'open'::public.ticket_status,
    "category" public.ticket_category not null default 'general'::public.ticket_category,
    "related_vin_record_id" uuid,
    "related_vehicle_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."support_tickets" enable row level security;


  create table "public"."ticket_attachments" (
    "id" uuid not null default gen_random_uuid(),
    "ticket_id" uuid not null,
    "reply_id" uuid,
    "file_name" text not null,
    "file_path" text not null,
    "file_size" integer,
    "mime_type" text,
    "uploaded_by" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."ticket_attachments" enable row level security;


  create table "public"."ticket_replies" (
    "id" uuid not null default gen_random_uuid(),
    "ticket_id" uuid not null,
    "author_id" uuid not null,
    "is_admin_reply" boolean not null default false,
    "message" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."ticket_replies" enable row level security;


  create table "public"."vin_records" (
    "id" uuid not null default gen_random_uuid(),
    "vin" text not null,
    "vehicle_id" uuid not null,
    "customer_id" uuid not null,
    "current_status" public.vin_status not null default 'pending'::public.vin_status,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."vin_records" enable row level security;


  create table "public"."vin_status_updates" (
    "id" uuid not null default gen_random_uuid(),
    "vin_record_id" uuid not null,
    "status" public.vin_status not null,
    "description" text,
    "updated_by" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."vin_status_updates" enable row level security;

drop type "public"."app_role__old_version_to_be_dropped";

drop type "public"."quote_status__old_version_to_be_dropped";

drop type "public"."quote_type__old_version_to_be_dropped";

alter table "public"."bid_requests" drop column "deposit_status";

alter table "public"."bid_requests" drop column "max_bid";

alter table "public"."bid_requests" drop column "status";

alter table "public"."bid_requests" drop column "vehicle_id";

alter table "public"."bid_requests" add column "auction_vehicle_id" uuid;

alter table "public"."bid_requests" add column "auction_vehicle_reference" text not null;

alter table "public"."bid_requests" add column "destination_country" text not null;

alter table "public"."bid_requests" add column "destination_port" text not null;

alter table "public"."bid_requests" add column "max_bid_amount" numeric(10,2) not null;

alter table "public"."bid_requests" add column "request_status" public.bid_request_status not null default 'pending'::public.bid_request_status;

alter table "public"."bid_requests" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."documents" drop column "file_url";

alter table "public"."documents" drop column "review_notes";

alter table "public"."documents" drop column "review_status";

alter table "public"."documents" drop column "reviewed_at";

alter table "public"."documents" drop column "reviewed_by";

alter table "public"."documents" drop column "type";

alter table "public"."documents" drop column "vehicle_id";

alter table "public"."documents" add column "document_type" public.document_type not null;

alter table "public"."documents" add column "file_name" text not null;

alter table "public"."documents" add column "file_path" text not null;

alter table "public"."documents" add column "file_size" integer;

alter table "public"."documents" add column "mime_type" text;

alter table "public"."documents" add column "vin_record_id" uuid not null;

alter table "public"."documents" alter column "uploaded_by" set not null;

alter table "public"."notifications" drop column "read";

alter table "public"."notifications" drop column "user_id";

alter table "public"."notifications" add column "customer_id" uuid not null;

alter table "public"."notifications" add column "is_read" boolean not null default false;

alter table "public"."notifications" add column "related_id" uuid;

alter table "public"."notifications" add column "related_type" text;

alter table "public"."notifications" add column "title" text not null;

alter table "public"."notifications" add column "type" text not null;

alter table "public"."quote_requests" drop column "admin_notes";

alter table "public"."quote_requests" drop column "amount_ngn";

alter table "public"."quote_requests" drop column "amount_usd";

alter table "public"."quote_requests" drop column "status";

alter table "public"."quote_requests" drop column "type";

alter table "public"."quote_requests" add column "destination_location" text not null;

alter table "public"."quote_requests" add column "origin_location" text not null;

alter table "public"."quote_requests" add column "quote_amount" numeric(10,2);

alter table "public"."quote_requests" add column "quote_status" public.quote_status not null default 'pending'::public.quote_status;

alter table "public"."quote_requests" add column "quote_type" public.quote_type not null;

alter table "public"."quote_requests" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."quote_requests" alter column "vehicle_details" set not null;

alter table "public"."user_roles" add column "created_at" timestamp with time zone not null default now();

alter table "public"."user_roles" alter column "role" set default 'customer'::public.app_role;

alter table "public"."user_roles" alter column "role" set data type public.app_role using "role"::text::public.app_role;

alter table "public"."vehicles" drop column "auction_date";

alter table "public"."vehicles" drop column "damage_description";

alter table "public"."vehicles" drop column "odometer";

alter table "public"."vehicles" drop column "run_and_drive";

alter table "public"."vehicles" drop column "status";

alter table "public"."vehicles" drop column "title_type";

alter table "public"."vehicles" drop column "vin";

alter table "public"."vehicles" drop column "yard_location";

alter table "public"."vehicles" add column "source" public.vehicle_source not null;

alter table "public"."vehicles" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."vehicles" add column "vehicle_type" public.vehicle_type not null;

alter table "public"."vehicles" alter column "auction_source" set data type public.auction_source using "auction_source"::public.auction_source;

alter table "public"."vehicles" alter column "customer_id" set not null;

alter table "public"."vehicles" alter column "make" set not null;

alter table "public"."vehicles" alter column "model" set not null;

alter table "public"."vehicles" alter column "year" set not null;

drop type "public"."auction_status";

drop type "public"."bid_status";

drop type "public"."currency_type";

drop type "public"."destination_port";

drop type "public"."dispute_status";

drop type "public"."payment_status";

drop type "public"."sailing_status";

CREATE UNIQUE INDEX admin_notifications_pkey ON public.admin_notifications USING btree (id);

CREATE UNIQUE INDEX app_settings_key_key ON public.app_settings USING btree (key);

CREATE UNIQUE INDEX app_settings_pkey ON public.app_settings USING btree (id);

CREATE UNIQUE INDEX auction_vehicles_pkey ON public.auction_vehicles USING btree (id);

CREATE UNIQUE INDEX customers_pkey ON public.customers USING btree (id);

CREATE UNIQUE INDEX customers_user_id_key ON public.customers USING btree (user_id);

CREATE INDEX idx_auction_vehicles_auction_date ON public.auction_vehicles USING btree (auction_date);

CREATE INDEX idx_auction_vehicles_auction_source ON public.auction_vehicles USING btree (auction_source);

CREATE INDEX idx_auction_vehicles_status ON public.auction_vehicles USING btree (status);

CREATE INDEX idx_bid_requests_auction_vehicle_id ON public.bid_requests USING btree (auction_vehicle_id);

CREATE INDEX idx_bid_requests_customer_id ON public.bid_requests USING btree (customer_id);

CREATE INDEX idx_bid_requests_status ON public.bid_requests USING btree (request_status);

CREATE INDEX idx_customers_account_status ON public.customers USING btree (account_status);

CREATE INDEX idx_customers_email ON public.customers USING btree (email);

CREATE INDEX idx_customers_user_id ON public.customers USING btree (user_id);

CREATE INDEX idx_documents_uploaded_by ON public.documents USING btree (uploaded_by);

CREATE INDEX idx_documents_vin_record_id ON public.documents USING btree (vin_record_id);

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);

CREATE INDEX idx_notifications_customer_id ON public.notifications USING btree (customer_id);

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);

CREATE INDEX idx_public_quote_requests_customer_id ON public.public_quote_requests USING btree (customer_id);

CREATE INDEX idx_quote_requests_customer_id ON public.quote_requests USING btree (customer_id);

CREATE INDEX idx_quote_requests_status ON public.quote_requests USING btree (quote_status);

CREATE INDEX idx_vehicles_customer_id ON public.vehicles USING btree (customer_id);

CREATE INDEX idx_vehicles_source ON public.vehicles USING btree (source);

CREATE INDEX idx_vehicles_vehicle_type ON public.vehicles USING btree (vehicle_type);

CREATE INDEX idx_vin_records_current_status ON public.vin_records USING btree (current_status);

CREATE INDEX idx_vin_records_customer_id ON public.vin_records USING btree (customer_id);

CREATE INDEX idx_vin_records_is_active ON public.vin_records USING btree (is_active);

CREATE INDEX idx_vin_records_vehicle_id ON public.vin_records USING btree (vehicle_id);

CREATE INDEX idx_vin_records_vin ON public.vin_records USING btree (vin);

CREATE INDEX idx_vin_status_updates_created_at ON public.vin_status_updates USING btree (created_at DESC);

CREATE INDEX idx_vin_status_updates_vin_record_id ON public.vin_status_updates USING btree (vin_record_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX public_quote_requests_pkey ON public.public_quote_requests USING btree (id);

CREATE UNIQUE INDEX support_tickets_pkey ON public.support_tickets USING btree (id);

CREATE UNIQUE INDEX ticket_attachments_pkey ON public.ticket_attachments USING btree (id);

CREATE UNIQUE INDEX ticket_replies_pkey ON public.ticket_replies USING btree (id);

CREATE UNIQUE INDEX vin_records_pkey ON public.vin_records USING btree (id);

CREATE UNIQUE INDEX vin_records_vin_key ON public.vin_records USING btree (vin);

CREATE UNIQUE INDEX vin_status_updates_pkey ON public.vin_status_updates USING btree (id);

alter table "public"."admin_notifications" add constraint "admin_notifications_pkey" PRIMARY KEY using index "admin_notifications_pkey";

alter table "public"."app_settings" add constraint "app_settings_pkey" PRIMARY KEY using index "app_settings_pkey";

alter table "public"."auction_vehicles" add constraint "auction_vehicles_pkey" PRIMARY KEY using index "auction_vehicles_pkey";

alter table "public"."customers" add constraint "customers_pkey" PRIMARY KEY using index "customers_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."public_quote_requests" add constraint "public_quote_requests_pkey" PRIMARY KEY using index "public_quote_requests_pkey";

alter table "public"."support_tickets" add constraint "support_tickets_pkey" PRIMARY KEY using index "support_tickets_pkey";

alter table "public"."ticket_attachments" add constraint "ticket_attachments_pkey" PRIMARY KEY using index "ticket_attachments_pkey";

alter table "public"."ticket_replies" add constraint "ticket_replies_pkey" PRIMARY KEY using index "ticket_replies_pkey";

alter table "public"."vin_records" add constraint "vin_records_pkey" PRIMARY KEY using index "vin_records_pkey";

alter table "public"."vin_status_updates" add constraint "vin_status_updates_pkey" PRIMARY KEY using index "vin_status_updates_pkey";

alter table "public"."app_settings" add constraint "app_settings_key_key" UNIQUE using index "app_settings_key_key";

alter table "public"."app_settings" add constraint "app_settings_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."app_settings" validate constraint "app_settings_updated_by_fkey";

alter table "public"."bid_requests" add constraint "bid_requests_auction_vehicle_id_fkey" FOREIGN KEY (auction_vehicle_id) REFERENCES public.auction_vehicles(id) ON DELETE SET NULL not valid;

alter table "public"."bid_requests" validate constraint "bid_requests_auction_vehicle_id_fkey";

alter table "public"."customers" add constraint "customers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."customers" validate constraint "customers_user_id_fkey";

alter table "public"."customers" add constraint "customers_user_id_key" UNIQUE using index "customers_user_id_key";

alter table "public"."documents" add constraint "documents_vin_record_id_fkey" FOREIGN KEY (vin_record_id) REFERENCES public.vin_records(id) ON DELETE CASCADE not valid;

alter table "public"."documents" validate constraint "documents_vin_record_id_fkey";

alter table "public"."notifications" add constraint "notifications_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_customer_id_fkey";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK ((type = ANY (ARRAY['status_update'::text, 'document_upload'::text, 'quote_response'::text, 'bid_outcome'::text, 'ticket_reply'::text, 'ticket_status'::text, 'quote_issued'::text, 'quote_expired'::text]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."public_quote_requests" add constraint "public_quote_requests_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL not valid;

alter table "public"."public_quote_requests" validate constraint "public_quote_requests_customer_id_fkey";

alter table "public"."support_tickets" add constraint "support_tickets_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE not valid;

alter table "public"."support_tickets" validate constraint "support_tickets_customer_id_fkey";

alter table "public"."support_tickets" add constraint "support_tickets_related_vehicle_id_fkey" FOREIGN KEY (related_vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL not valid;

alter table "public"."support_tickets" validate constraint "support_tickets_related_vehicle_id_fkey";

alter table "public"."support_tickets" add constraint "support_tickets_related_vin_record_id_fkey" FOREIGN KEY (related_vin_record_id) REFERENCES public.vin_records(id) ON DELETE SET NULL not valid;

alter table "public"."support_tickets" validate constraint "support_tickets_related_vin_record_id_fkey";

alter table "public"."ticket_attachments" add constraint "ticket_attachments_reply_id_fkey" FOREIGN KEY (reply_id) REFERENCES public.ticket_replies(id) ON DELETE CASCADE not valid;

alter table "public"."ticket_attachments" validate constraint "ticket_attachments_reply_id_fkey";

alter table "public"."ticket_attachments" add constraint "ticket_attachments_ticket_id_fkey" FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE not valid;

alter table "public"."ticket_attachments" validate constraint "ticket_attachments_ticket_id_fkey";

alter table "public"."ticket_replies" add constraint "ticket_replies_ticket_id_fkey" FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE not valid;

alter table "public"."ticket_replies" validate constraint "ticket_replies_ticket_id_fkey";

alter table "public"."vehicles" add constraint "vehicles_year_check" CHECK (((year >= 1900) AND (year <= 2100))) not valid;

alter table "public"."vehicles" validate constraint "vehicles_year_check";

alter table "public"."vin_records" add constraint "vin_records_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE not valid;

alter table "public"."vin_records" validate constraint "vin_records_customer_id_fkey";

alter table "public"."vin_records" add constraint "vin_records_vehicle_id_fkey" FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE not valid;

alter table "public"."vin_records" validate constraint "vin_records_vehicle_id_fkey";

alter table "public"."vin_records" add constraint "vin_records_vin_key" UNIQUE using index "vin_records_vin_key";

alter table "public"."vin_status_updates" add constraint "vin_status_updates_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."vin_status_updates" validate constraint "vin_status_updates_updated_by_fkey";

alter table "public"."vin_status_updates" add constraint "vin_status_updates_vin_record_id_fkey" FOREIGN KEY (vin_record_id) REFERENCES public.vin_records(id) ON DELETE CASCADE not valid;

alter table "public"."vin_status_updates" validate constraint "vin_status_updates_vin_record_id_fkey";

alter table "public"."bid_requests" add constraint "bid_requests_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE not valid;

alter table "public"."bid_requests" validate constraint "bid_requests_customer_id_fkey";

alter table "public"."quote_requests" add constraint "quote_requests_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE not valid;

alter table "public"."quote_requests" validate constraint "quote_requests_customer_id_fkey";

alter table "public"."vehicles" add constraint "vehicles_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE not valid;

alter table "public"."vehicles" validate constraint "vehicles_customer_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_access(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT auth.uid() = _user_id OR public.has_role(auth.uid(), 'admin')
$function$
;

CREATE OR REPLACE FUNCTION public.create_public_quote_request(p_quote_type public.quote_type, p_vehicle_details text, p_origin_location text, p_destination_location text, p_contact_email text, p_contact_name text, p_contact_phone text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.public_quote_requests (
    quote_type,
    vehicle_details,
    origin_location,
    destination_location,
    contact_name,
    contact_email,
    contact_phone
  ) VALUES (
    p_quote_type,
    p_vehicle_details,
    p_origin_location,
    p_destination_location,
    p_contact_name,
    p_contact_email,
    p_contact_phone
  )
  RETURNING id INTO v_id;

  RETURN json_build_object(
    'success', true,
    'id', v_id,
    'message', 'Quote request submitted successfully'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_public_quote_request(p_quote_type public.quote_type, p_vehicle_details text, p_origin_location text, p_destination_location text, p_contact_email text, p_contact_name text, p_contact_phone text, p_customer_id uuid DEFAULT NULL::uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.public_quote_requests (
    quote_type,
    vehicle_details,
    origin_location,
    destination_location,
    contact_name,
    contact_email,
    contact_phone,
    customer_id
  ) VALUES (
    p_quote_type,
    p_vehicle_details,
    p_origin_location,
    p_destination_location,
    p_contact_name,
    p_contact_email,
    p_contact_phone,
    p_customer_id
  )
  RETURNING id INTO v_id;

  RETURN json_build_object(
    'success', true,
    'id', v_id,
    'message', 'Quote request submitted successfully'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
 RETURNS public.app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$function$
;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$
;

CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT auth.uid() = _user_id
$function$
;

CREATE OR REPLACE FUNCTION public.notify_admin_new_bid_request()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_customer_name TEXT;
  v_vehicle_info TEXT;
BEGIN
  -- Get customer name
  SELECT full_name INTO v_customer_name
  FROM customers WHERE id = NEW.customer_id;
  
  -- Get vehicle info if linked
  IF NEW.auction_vehicle_id IS NOT NULL THEN
    SELECT year || ' ' || make || ' ' || model INTO v_vehicle_info
    FROM auction_vehicles WHERE id = NEW.auction_vehicle_id;
  ELSE
    v_vehicle_info := NEW.auction_vehicle_reference;
  END IF;
  
  -- Create admin notification
  INSERT INTO public.admin_notifications (type, title, message, related_id, related_type)
  VALUES (
    'new_bid_request',
    'New Bid Request',
    COALESCE(v_customer_name, 'A customer') || ' submitted a bid request for ' || 
    COALESCE(v_vehicle_info, NEW.auction_vehicle_reference) || 
    ' with max bid $' || NEW.max_bid_amount::TEXT || '.',
    NEW.id,
    'bid_request'
  );
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_admin_new_quote()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_vehicle_info TEXT;
  v_vehicle_details JSONB;
BEGIN
  -- Parse vehicle details for display
  BEGIN
    v_vehicle_details := NEW.vehicle_details::jsonb;
    v_vehicle_info := COALESCE(
      v_vehicle_details->>'year' || ' ' || 
      v_vehicle_details->>'make' || ' ' || 
      v_vehicle_details->>'model',
      'Vehicle'
    );
  EXCEPTION WHEN OTHERS THEN
    v_vehicle_info := 'Vehicle';
  END;
  
  -- Create admin notification for new quote
  INSERT INTO public.admin_notifications (type, title, message, related_id, related_type)
  VALUES (
    'new_quote_request',
    'New Quote Request',
    NEW.contact_name || ' submitted a ' ||
      CASE NEW.quote_type
        WHEN 'ocean_freight' THEN 'Ocean Freight'
        WHEN 'inland_freight' THEN 'Inland Freight'
        ELSE 'freight'
      END || ' quote request for ' || v_vehicle_info || '.',
    NEW.id,
    'public_quote'
  );
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_admin_new_ticket()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_customer_name TEXT;
BEGIN
  SELECT full_name INTO v_customer_name
  FROM customers WHERE id = NEW.customer_id;
  
  INSERT INTO public.admin_notifications (type, title, message, related_id, related_type)
  VALUES (
    'new_support_ticket',
    'New Support Ticket',
    COALESCE(v_customer_name, 'A customer') || ' submitted a ' || NEW.priority || ' priority ticket: ' || NEW.subject,
    NEW.id,
    'support_ticket'
  );
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_bid_outcome()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only notify on status changes (not on insert)
  IF OLD.request_status IS DISTINCT FROM NEW.request_status THEN
    INSERT INTO notifications (customer_id, type, title, message, related_id, related_type)
    VALUES (
      NEW.customer_id,
      'bid_outcome',
      'Bid Request Updated',
      'Your bid for ' || NEW.auction_vehicle_reference || ' status changed to ' ||
        CASE NEW.request_status
          WHEN 'pending' THEN 'Pending'
          WHEN 'approved' THEN 'Approved'
          WHEN 'rejected' THEN 'Rejected'
          WHEN 'won' THEN 'Won'
          WHEN 'lost' THEN 'Lost'
          ELSE NEW.request_status
        END,
      NEW.id,
      'bid'
    );
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_customer_ticket_reply()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_customer_id UUID;
  v_ticket_subject TEXT;
BEGIN
  IF NEW.is_admin_reply = true THEN
    SELECT st.customer_id, st.subject
    INTO v_customer_id, v_ticket_subject
    FROM support_tickets st
    WHERE st.id = NEW.ticket_id;
    
    INSERT INTO public.notifications (customer_id, type, title, message, related_id, related_type)
    VALUES (
      v_customer_id,
      'ticket_reply',
      'New Reply on Your Ticket',
      'An admin has replied to your support ticket: ' || v_ticket_subject,
      NEW.ticket_id,
      'support_ticket'
    );
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_document_upload()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_customer_id UUID;
  v_vin TEXT;
BEGIN
  -- Get customer_id and VIN from vin_record
  SELECT customer_id, vin
  INTO v_customer_id, v_vin
  FROM vin_records
  WHERE id = NEW.vin_record_id;

  -- Insert notification
  INSERT INTO notifications (customer_id, type, title, message, related_id, related_type)
  VALUES (
    v_customer_id,
    'document_upload',
    'New Document Available',
    'A new ' || 
      CASE NEW.document_type
        WHEN 'invoice' THEN 'invoice'
        WHEN 'bill_of_lading' THEN 'bill of lading'
        WHEN 'photo' THEN 'photo'
        ELSE 'document'
      END || ' has been uploaded for VIN: ' || v_vin,
    NEW.vin_record_id,
    'document'
  );

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_public_quote_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_vehicle_info TEXT;
  v_vehicle_details JSONB;
BEGIN
  -- Only notify if customer is linked and status changed
  IF NEW.customer_id IS NOT NULL AND OLD.quote_status IS DISTINCT FROM NEW.quote_status THEN
    
    -- Parse vehicle details for display
    BEGIN
      v_vehicle_details := NEW.vehicle_details::jsonb;
      v_vehicle_info := COALESCE(
        v_vehicle_details->>'year' || ' ' || 
        v_vehicle_details->>'make' || ' ' || 
        v_vehicle_details->>'model',
        'your vehicle'
      );
    EXCEPTION WHEN OTHERS THEN
      v_vehicle_info := 'your vehicle';
    END;
    
    -- Notify when quote is issued
    IF NEW.quote_status = 'issued' THEN
      INSERT INTO public.notifications (customer_id, type, title, message, related_id, related_type)
      VALUES (
        NEW.customer_id,
        'quote_issued',
        'Quote Issued',
        'Your ' || 
          CASE NEW.quote_type
            WHEN 'ocean_freight' THEN 'Ocean Freight'
            WHEN 'inland_freight' THEN 'Inland Freight'
            ELSE 'freight'
          END || ' quote for ' || v_vehicle_info || ' has been issued.' ||
          CASE WHEN NEW.quote_amount IS NOT NULL 
            THEN ' Quote amount: ' || NEW.currency || ' ' || NEW.quote_amount::TEXT
            ELSE ''
          END,
        NEW.id,
        'public_quote'
      );
    END IF;
    
    -- Notify when quote expires
    IF NEW.quote_status = 'expired' THEN
      INSERT INTO public.notifications (customer_id, type, title, message, related_id, related_type)
      VALUES (
        NEW.customer_id,
        'quote_expired',
        'Quote Expired',
        'Your ' || 
          CASE NEW.quote_type
            WHEN 'ocean_freight' THEN 'Ocean Freight'
            WHEN 'inland_freight' THEN 'Inland Freight'
            ELSE 'freight'
          END || ' quote for ' || v_vehicle_info || ' has expired. Please submit a new request if needed.',
        NEW.id,
        'public_quote'
      );
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_quote_response()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only notify on status changes (not on insert)
  IF OLD.quote_status IS DISTINCT FROM NEW.quote_status THEN
    INSERT INTO notifications (customer_id, type, title, message, related_id, related_type)
    VALUES (
      NEW.customer_id,
      'quote_response',
      'Quote Request Updated',
      'Your ' || 
        CASE NEW.quote_type
          WHEN 'ocean_freight' THEN 'Ocean Freight'
          WHEN 'inland_freight' THEN 'Inland Freight'
          ELSE 'freight'
        END || ' quote request status changed to ' ||
        CASE NEW.quote_status
          WHEN 'pending' THEN 'Pending'
          WHEN 'issued' THEN 'Issued'
          WHEN 'expired' THEN 'Expired'
          WHEN 'accepted' THEN 'Accepted'
          ELSE NEW.quote_status
        END ||
        CASE WHEN NEW.quote_status = 'issued' AND NEW.quote_amount IS NOT NULL 
          THEN ' - Quote amount: $' || NEW.quote_amount::TEXT
          ELSE ''
        END,
      NEW.id,
      'quote'
    );
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_status_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_customer_id UUID;
  v_vin TEXT;
  v_vehicle_info TEXT;
BEGIN
  -- Get customer_id and vehicle info from vin_record
  SELECT vr.customer_id, vr.vin, 
         v.year || ' ' || v.make || ' ' || v.model
  INTO v_customer_id, v_vin, v_vehicle_info
  FROM vin_records vr
  JOIN vehicles v ON v.id = vr.vehicle_id
  WHERE vr.id = NEW.vin_record_id;

  -- Insert notification
  INSERT INTO notifications (customer_id, type, title, message, related_id, related_type)
  VALUES (
    v_customer_id,
    'status_update',
    'Vehicle Status Updated',
    'Your ' || v_vehicle_info || ' (VIN: ' || v_vin || ') status changed to ' || 
      CASE NEW.status
        WHEN 'pending' THEN 'Pending'
        WHEN 'active' THEN 'Active'
        WHEN 'awaiting_action' THEN 'Awaiting Action'
        WHEN 'in_progress' THEN 'In Progress'
        WHEN 'delayed' THEN 'Delayed'
        WHEN 'completed' THEN 'Completed'
        WHEN 'cancelled' THEN 'Cancelled'
        ELSE NEW.status
      END,
    NEW.vin_record_id,
    'vin_record'
  );

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_ticket_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (customer_id, type, title, message, related_id, related_type)
    VALUES (
      NEW.customer_id,
      'ticket_status',
      'Ticket Status Updated',
      'Your support ticket "' || NEW.subject || '" status changed to ' ||
        CASE NEW.status
          WHEN 'open' THEN 'Open'
          WHEN 'in_progress' THEN 'In Progress'
          WHEN 'awaiting_customer' THEN 'Awaiting Your Response'
          WHEN 'resolved' THEN 'Resolved'
          WHEN 'closed' THEN 'Closed'
          ELSE NEW.status::text
        END,
      NEW.id,
      'support_ticket'
    );
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_vin_current_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  normalized_status vin_status;
BEGIN
  -- Normalize status: lowercase and replace spaces with underscores
  normalized_status := lower(replace(NEW.status::text, ' ', '_'))::vin_status;
  
  UPDATE public.vin_records
  SET current_status = normalized_status,
      updated_at = now()
  WHERE id = NEW.vin_record_id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.track_vin_public(p_vin text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result JSON;
  v_vin_record RECORD;
BEGIN
  -- Normalize VIN to uppercase
  p_vin := UPPER(TRIM(p_vin));
  
  -- Validate VIN format (basic check: 17 alphanumeric characters, no I, O, Q)
  IF LENGTH(p_vin) != 17 OR p_vin !~ '^[A-HJ-NPR-Z0-9]{17}$' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'invalid_format',
      'message', 'Invalid VIN format. VIN must be 17 characters.'
    );
  END IF;
  
  -- Find the VIN record with vehicle info
  SELECT 
    vr.id,
    vr.vin,
    vr.current_status,
    vr.is_active,
    v.make,
    v.model,
    v.year,
    v.vehicle_type,
    v.source,
    v.auction_source
  INTO v_vin_record
  FROM vin_records vr
  JOIN vehicles v ON v.id = vr.vehicle_id
  WHERE vr.vin = p_vin
  LIMIT 1;
  
  -- If not found, return error
  IF v_vin_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'not_found',
      'message', 'VIN not found. Please check and try again.'
    );
  END IF;
  
  -- Build result with status history (limited info, no customer data)
  SELECT json_build_object(
    'success', true,
    'data', json_build_object(
      'vin', v_vin_record.vin,
      'vehicle', json_build_object(
        'make', v_vin_record.make,
        'model', v_vin_record.model,
        'year', v_vin_record.year,
        'type', v_vin_record.vehicle_type,
        'source', v_vin_record.source,
        'auction_source', v_vin_record.auction_source
      ),
      'current_status', v_vin_record.current_status,
      'is_active', v_vin_record.is_active,
      'status_history', COALESCE(
        (SELECT json_agg(
          json_build_object(
            'status', vsu.status,
            'description', vsu.description,
            'date', vsu.created_at
          ) ORDER BY vsu.created_at DESC
        )
        FROM vin_status_updates vsu
        WHERE vsu.vin_record_id = v_vin_record.id
        LIMIT 10),
        '[]'::json
      )
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.raw_user_meta_data ->> 'phone'
  );
  
  -- Assign default customer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  -- Create customer record with phone
  INSERT INTO public.customers (user_id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone'
  );
  
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."admin_notifications" to "anon";

grant insert on table "public"."admin_notifications" to "anon";

grant references on table "public"."admin_notifications" to "anon";

grant select on table "public"."admin_notifications" to "anon";

grant trigger on table "public"."admin_notifications" to "anon";

grant truncate on table "public"."admin_notifications" to "anon";

grant update on table "public"."admin_notifications" to "anon";

grant delete on table "public"."admin_notifications" to "authenticated";

grant insert on table "public"."admin_notifications" to "authenticated";

grant references on table "public"."admin_notifications" to "authenticated";

grant select on table "public"."admin_notifications" to "authenticated";

grant trigger on table "public"."admin_notifications" to "authenticated";

grant truncate on table "public"."admin_notifications" to "authenticated";

grant update on table "public"."admin_notifications" to "authenticated";

grant delete on table "public"."admin_notifications" to "service_role";

grant insert on table "public"."admin_notifications" to "service_role";

grant references on table "public"."admin_notifications" to "service_role";

grant select on table "public"."admin_notifications" to "service_role";

grant trigger on table "public"."admin_notifications" to "service_role";

grant truncate on table "public"."admin_notifications" to "service_role";

grant update on table "public"."admin_notifications" to "service_role";

grant delete on table "public"."app_settings" to "anon";

grant insert on table "public"."app_settings" to "anon";

grant references on table "public"."app_settings" to "anon";

grant select on table "public"."app_settings" to "anon";

grant trigger on table "public"."app_settings" to "anon";

grant truncate on table "public"."app_settings" to "anon";

grant update on table "public"."app_settings" to "anon";

grant delete on table "public"."app_settings" to "authenticated";

grant insert on table "public"."app_settings" to "authenticated";

grant references on table "public"."app_settings" to "authenticated";

grant select on table "public"."app_settings" to "authenticated";

grant trigger on table "public"."app_settings" to "authenticated";

grant truncate on table "public"."app_settings" to "authenticated";

grant update on table "public"."app_settings" to "authenticated";

grant delete on table "public"."app_settings" to "service_role";

grant insert on table "public"."app_settings" to "service_role";

grant references on table "public"."app_settings" to "service_role";

grant select on table "public"."app_settings" to "service_role";

grant trigger on table "public"."app_settings" to "service_role";

grant truncate on table "public"."app_settings" to "service_role";

grant update on table "public"."app_settings" to "service_role";

grant delete on table "public"."auction_vehicles" to "anon";

grant insert on table "public"."auction_vehicles" to "anon";

grant references on table "public"."auction_vehicles" to "anon";

grant select on table "public"."auction_vehicles" to "anon";

grant trigger on table "public"."auction_vehicles" to "anon";

grant truncate on table "public"."auction_vehicles" to "anon";

grant update on table "public"."auction_vehicles" to "anon";

grant delete on table "public"."auction_vehicles" to "authenticated";

grant insert on table "public"."auction_vehicles" to "authenticated";

grant references on table "public"."auction_vehicles" to "authenticated";

grant select on table "public"."auction_vehicles" to "authenticated";

grant trigger on table "public"."auction_vehicles" to "authenticated";

grant truncate on table "public"."auction_vehicles" to "authenticated";

grant update on table "public"."auction_vehicles" to "authenticated";

grant delete on table "public"."auction_vehicles" to "service_role";

grant insert on table "public"."auction_vehicles" to "service_role";

grant references on table "public"."auction_vehicles" to "service_role";

grant select on table "public"."auction_vehicles" to "service_role";

grant trigger on table "public"."auction_vehicles" to "service_role";

grant truncate on table "public"."auction_vehicles" to "service_role";

grant update on table "public"."auction_vehicles" to "service_role";

grant delete on table "public"."bid_requests" to "anon";

grant insert on table "public"."bid_requests" to "anon";

grant select on table "public"."bid_requests" to "anon";

grant update on table "public"."bid_requests" to "anon";

grant delete on table "public"."bid_requests" to "authenticated";

grant insert on table "public"."bid_requests" to "authenticated";

grant select on table "public"."bid_requests" to "authenticated";

grant update on table "public"."bid_requests" to "authenticated";

grant delete on table "public"."bid_requests" to "service_role";

grant insert on table "public"."bid_requests" to "service_role";

grant select on table "public"."bid_requests" to "service_role";

grant update on table "public"."bid_requests" to "service_role";

grant delete on table "public"."customers" to "anon";

grant insert on table "public"."customers" to "anon";

grant references on table "public"."customers" to "anon";

grant select on table "public"."customers" to "anon";

grant trigger on table "public"."customers" to "anon";

grant truncate on table "public"."customers" to "anon";

grant update on table "public"."customers" to "anon";

grant delete on table "public"."customers" to "authenticated";

grant insert on table "public"."customers" to "authenticated";

grant references on table "public"."customers" to "authenticated";

grant select on table "public"."customers" to "authenticated";

grant trigger on table "public"."customers" to "authenticated";

grant truncate on table "public"."customers" to "authenticated";

grant update on table "public"."customers" to "authenticated";

grant delete on table "public"."customers" to "service_role";

grant insert on table "public"."customers" to "service_role";

grant references on table "public"."customers" to "service_role";

grant select on table "public"."customers" to "service_role";

grant trigger on table "public"."customers" to "service_role";

grant truncate on table "public"."customers" to "service_role";

grant update on table "public"."customers" to "service_role";

grant delete on table "public"."documents" to "anon";

grant insert on table "public"."documents" to "anon";

grant select on table "public"."documents" to "anon";

grant update on table "public"."documents" to "anon";

grant delete on table "public"."documents" to "authenticated";

grant insert on table "public"."documents" to "authenticated";

grant select on table "public"."documents" to "authenticated";

grant update on table "public"."documents" to "authenticated";

grant delete on table "public"."documents" to "service_role";

grant insert on table "public"."documents" to "service_role";

grant select on table "public"."documents" to "service_role";

grant update on table "public"."documents" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."public_quote_requests" to "anon";

grant insert on table "public"."public_quote_requests" to "anon";

grant references on table "public"."public_quote_requests" to "anon";

grant select on table "public"."public_quote_requests" to "anon";

grant trigger on table "public"."public_quote_requests" to "anon";

grant truncate on table "public"."public_quote_requests" to "anon";

grant update on table "public"."public_quote_requests" to "anon";

grant delete on table "public"."public_quote_requests" to "authenticated";

grant insert on table "public"."public_quote_requests" to "authenticated";

grant references on table "public"."public_quote_requests" to "authenticated";

grant select on table "public"."public_quote_requests" to "authenticated";

grant trigger on table "public"."public_quote_requests" to "authenticated";

grant truncate on table "public"."public_quote_requests" to "authenticated";

grant update on table "public"."public_quote_requests" to "authenticated";

grant delete on table "public"."public_quote_requests" to "service_role";

grant insert on table "public"."public_quote_requests" to "service_role";

grant references on table "public"."public_quote_requests" to "service_role";

grant select on table "public"."public_quote_requests" to "service_role";

grant trigger on table "public"."public_quote_requests" to "service_role";

grant truncate on table "public"."public_quote_requests" to "service_role";

grant update on table "public"."public_quote_requests" to "service_role";

grant delete on table "public"."quote_requests" to "anon";

grant insert on table "public"."quote_requests" to "anon";

grant select on table "public"."quote_requests" to "anon";

grant update on table "public"."quote_requests" to "anon";

grant delete on table "public"."quote_requests" to "authenticated";

grant insert on table "public"."quote_requests" to "authenticated";

grant select on table "public"."quote_requests" to "authenticated";

grant update on table "public"."quote_requests" to "authenticated";

grant delete on table "public"."quote_requests" to "service_role";

grant insert on table "public"."quote_requests" to "service_role";

grant select on table "public"."quote_requests" to "service_role";

grant update on table "public"."quote_requests" to "service_role";

grant delete on table "public"."support_tickets" to "anon";

grant insert on table "public"."support_tickets" to "anon";

grant references on table "public"."support_tickets" to "anon";

grant select on table "public"."support_tickets" to "anon";

grant trigger on table "public"."support_tickets" to "anon";

grant truncate on table "public"."support_tickets" to "anon";

grant update on table "public"."support_tickets" to "anon";

grant delete on table "public"."support_tickets" to "authenticated";

grant insert on table "public"."support_tickets" to "authenticated";

grant references on table "public"."support_tickets" to "authenticated";

grant select on table "public"."support_tickets" to "authenticated";

grant trigger on table "public"."support_tickets" to "authenticated";

grant truncate on table "public"."support_tickets" to "authenticated";

grant update on table "public"."support_tickets" to "authenticated";

grant delete on table "public"."support_tickets" to "service_role";

grant insert on table "public"."support_tickets" to "service_role";

grant references on table "public"."support_tickets" to "service_role";

grant select on table "public"."support_tickets" to "service_role";

grant trigger on table "public"."support_tickets" to "service_role";

grant truncate on table "public"."support_tickets" to "service_role";

grant update on table "public"."support_tickets" to "service_role";

grant delete on table "public"."ticket_attachments" to "anon";

grant insert on table "public"."ticket_attachments" to "anon";

grant references on table "public"."ticket_attachments" to "anon";

grant select on table "public"."ticket_attachments" to "anon";

grant trigger on table "public"."ticket_attachments" to "anon";

grant truncate on table "public"."ticket_attachments" to "anon";

grant update on table "public"."ticket_attachments" to "anon";

grant delete on table "public"."ticket_attachments" to "authenticated";

grant insert on table "public"."ticket_attachments" to "authenticated";

grant references on table "public"."ticket_attachments" to "authenticated";

grant select on table "public"."ticket_attachments" to "authenticated";

grant trigger on table "public"."ticket_attachments" to "authenticated";

grant truncate on table "public"."ticket_attachments" to "authenticated";

grant update on table "public"."ticket_attachments" to "authenticated";

grant delete on table "public"."ticket_attachments" to "service_role";

grant insert on table "public"."ticket_attachments" to "service_role";

grant references on table "public"."ticket_attachments" to "service_role";

grant select on table "public"."ticket_attachments" to "service_role";

grant trigger on table "public"."ticket_attachments" to "service_role";

grant truncate on table "public"."ticket_attachments" to "service_role";

grant update on table "public"."ticket_attachments" to "service_role";

grant delete on table "public"."ticket_replies" to "anon";

grant insert on table "public"."ticket_replies" to "anon";

grant references on table "public"."ticket_replies" to "anon";

grant select on table "public"."ticket_replies" to "anon";

grant trigger on table "public"."ticket_replies" to "anon";

grant truncate on table "public"."ticket_replies" to "anon";

grant update on table "public"."ticket_replies" to "anon";

grant delete on table "public"."ticket_replies" to "authenticated";

grant insert on table "public"."ticket_replies" to "authenticated";

grant references on table "public"."ticket_replies" to "authenticated";

grant select on table "public"."ticket_replies" to "authenticated";

grant trigger on table "public"."ticket_replies" to "authenticated";

grant truncate on table "public"."ticket_replies" to "authenticated";

grant update on table "public"."ticket_replies" to "authenticated";

grant delete on table "public"."ticket_replies" to "service_role";

grant insert on table "public"."ticket_replies" to "service_role";

grant references on table "public"."ticket_replies" to "service_role";

grant select on table "public"."ticket_replies" to "service_role";

grant trigger on table "public"."ticket_replies" to "service_role";

grant truncate on table "public"."ticket_replies" to "service_role";

grant update on table "public"."ticket_replies" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

grant delete on table "public"."vehicles" to "anon";

grant insert on table "public"."vehicles" to "anon";

grant select on table "public"."vehicles" to "anon";

grant update on table "public"."vehicles" to "anon";

grant delete on table "public"."vehicles" to "authenticated";

grant insert on table "public"."vehicles" to "authenticated";

grant select on table "public"."vehicles" to "authenticated";

grant update on table "public"."vehicles" to "authenticated";

grant delete on table "public"."vehicles" to "service_role";

grant insert on table "public"."vehicles" to "service_role";

grant select on table "public"."vehicles" to "service_role";

grant update on table "public"."vehicles" to "service_role";

grant delete on table "public"."vin_records" to "anon";

grant insert on table "public"."vin_records" to "anon";

grant references on table "public"."vin_records" to "anon";

grant select on table "public"."vin_records" to "anon";

grant trigger on table "public"."vin_records" to "anon";

grant truncate on table "public"."vin_records" to "anon";

grant update on table "public"."vin_records" to "anon";

grant delete on table "public"."vin_records" to "authenticated";

grant insert on table "public"."vin_records" to "authenticated";

grant references on table "public"."vin_records" to "authenticated";

grant select on table "public"."vin_records" to "authenticated";

grant trigger on table "public"."vin_records" to "authenticated";

grant truncate on table "public"."vin_records" to "authenticated";

grant update on table "public"."vin_records" to "authenticated";

grant delete on table "public"."vin_records" to "service_role";

grant insert on table "public"."vin_records" to "service_role";

grant references on table "public"."vin_records" to "service_role";

grant select on table "public"."vin_records" to "service_role";

grant trigger on table "public"."vin_records" to "service_role";

grant truncate on table "public"."vin_records" to "service_role";

grant update on table "public"."vin_records" to "service_role";

grant delete on table "public"."vin_status_updates" to "anon";

grant insert on table "public"."vin_status_updates" to "anon";

grant references on table "public"."vin_status_updates" to "anon";

grant select on table "public"."vin_status_updates" to "anon";

grant trigger on table "public"."vin_status_updates" to "anon";

grant truncate on table "public"."vin_status_updates" to "anon";

grant update on table "public"."vin_status_updates" to "anon";

grant delete on table "public"."vin_status_updates" to "authenticated";

grant insert on table "public"."vin_status_updates" to "authenticated";

grant references on table "public"."vin_status_updates" to "authenticated";

grant select on table "public"."vin_status_updates" to "authenticated";

grant trigger on table "public"."vin_status_updates" to "authenticated";

grant truncate on table "public"."vin_status_updates" to "authenticated";

grant update on table "public"."vin_status_updates" to "authenticated";

grant delete on table "public"."vin_status_updates" to "service_role";

grant insert on table "public"."vin_status_updates" to "service_role";

grant references on table "public"."vin_status_updates" to "service_role";

grant select on table "public"."vin_status_updates" to "service_role";

grant trigger on table "public"."vin_status_updates" to "service_role";

grant truncate on table "public"."vin_status_updates" to "service_role";

grant update on table "public"."vin_status_updates" to "service_role";


  create policy "Admins can delete admin notifications"
  on "public"."admin_notifications"
  as permissive
  for delete
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can update admin notifications"
  on "public"."admin_notifications"
  as permissive
  for update
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view admin notifications"
  on "public"."admin_notifications"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can insert settings"
  on "public"."app_settings"
  as permissive
  for insert
  to public
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can update settings"
  on "public"."app_settings"
  as permissive
  for update
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all settings"
  on "public"."app_settings"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Anyone can read maintenance mode setting"
  on "public"."app_settings"
  as permissive
  for select
  to public
using ((key = 'maintenance_mode'::text));



  create policy "Admins can create auction vehicles"
  on "public"."auction_vehicles"
  as permissive
  for insert
  to public
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can delete auction vehicles"
  on "public"."auction_vehicles"
  as permissive
  for delete
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can update auction vehicles"
  on "public"."auction_vehicles"
  as permissive
  for update
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all auction vehicles"
  on "public"."auction_vehicles"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Anyone can view active auction vehicles"
  on "public"."auction_vehicles"
  as permissive
  for select
  to public
using ((status = 'active'::public.auction_vehicle_status));



  create policy "Admins can delete bid requests"
  on "public"."bid_requests"
  as permissive
  for delete
  to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can update bid requests"
  on "public"."bid_requests"
  as permissive
  for update
  to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all bid requests"
  on "public"."bid_requests"
  as permissive
  for select
  to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Customers can create their own bid requests"
  on "public"."bid_requests"
  as permissive
  for insert
  to authenticated
with check ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))));



  create policy "Customers can view their own bid requests"
  on "public"."bid_requests"
  as permissive
  for select
  to authenticated
using ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))));



  create policy "Admins can create customers"
  on "public"."customers"
  as permissive
  for insert
  to public
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can delete customers"
  on "public"."customers"
  as permissive
  for delete
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can update any customer"
  on "public"."customers"
  as permissive
  for update
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all customers"
  on "public"."customers"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Customers can update their own record"
  on "public"."customers"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Customers can view their own record"
  on "public"."customers"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins can create documents"
  on "public"."documents"
  as permissive
  for insert
  to authenticated
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can delete documents"
  on "public"."documents"
  as permissive
  for delete
  to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can update documents"
  on "public"."documents"
  as permissive
  for update
  to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all documents"
  on "public"."documents"
  as permissive
  for select
  to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Customers can view their own documents"
  on "public"."documents"
  as permissive
  for select
  to authenticated
using ((vin_record_id IN ( SELECT vr.id
   FROM (public.vin_records vr
     JOIN public.customers c ON ((vr.customer_id = c.id)))
  WHERE (c.user_id = auth.uid()))));



  create policy "Admins can create notifications"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Customers can update their own notifications"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))))
with check ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))));



  create policy "Customers can view their own notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))));



  create policy "Admins can update any profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all profiles"
  on "public"."profiles"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Users can insert their own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can update their own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "Users can view their own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "Admins can delete public quote requests"
  on "public"."public_quote_requests"
  as permissive
  for delete
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can update public quote requests"
  on "public"."public_quote_requests"
  as permissive
  for update
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all public quote requests"
  on "public"."public_quote_requests"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Anyone can create public quote requests"
  on "public"."public_quote_requests"
  as permissive
  for insert
  to public
with check (true);



  create policy "Customers can view their own linked quote requests"
  on "public"."public_quote_requests"
  as permissive
  for select
  to public
using ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))));



  create policy "Admins can delete quote requests"
  on "public"."quote_requests"
  as permissive
  for delete
  to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can update quote requests"
  on "public"."quote_requests"
  as permissive
  for update
  to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all quote requests"
  on "public"."quote_requests"
  as permissive
  for select
  to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Customers can create their own quote requests"
  on "public"."quote_requests"
  as permissive
  for insert
  to authenticated
with check ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))));



  create policy "Customers can view their own quote requests"
  on "public"."quote_requests"
  as permissive
  for select
  to authenticated
using ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))));



  create policy "Admins can delete tickets"
  on "public"."support_tickets"
  as permissive
  for delete
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can update all tickets"
  on "public"."support_tickets"
  as permissive
  for update
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all tickets"
  on "public"."support_tickets"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Customers can create their own tickets"
  on "public"."support_tickets"
  as permissive
  for insert
  to public
with check ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))));



  create policy "Customers can update their own tickets"
  on "public"."support_tickets"
  as permissive
  for update
  to public
using ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))))
with check ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))));



  create policy "Customers can view their own tickets"
  on "public"."support_tickets"
  as permissive
  for select
  to public
using ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))));



  create policy "Admins can add attachments"
  on "public"."ticket_attachments"
  as permissive
  for insert
  to public
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can delete attachments"
  on "public"."ticket_attachments"
  as permissive
  for delete
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all attachments"
  on "public"."ticket_attachments"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Customers can add attachments to their tickets"
  on "public"."ticket_attachments"
  as permissive
  for insert
  to public
with check (((ticket_id IN ( SELECT st.id
   FROM (public.support_tickets st
     JOIN public.customers c ON ((st.customer_id = c.id)))
  WHERE (c.user_id = auth.uid()))) OR public.has_role(auth.uid(), 'admin'::public.app_role)));



  create policy "Customers can view attachments on their tickets"
  on "public"."ticket_attachments"
  as permissive
  for select
  to public
using ((ticket_id IN ( SELECT st.id
   FROM (public.support_tickets st
     JOIN public.customers c ON ((st.customer_id = c.id)))
  WHERE (c.user_id = auth.uid()))));



  create policy "Admins can create replies"
  on "public"."ticket_replies"
  as permissive
  for insert
  to public
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can delete replies"
  on "public"."ticket_replies"
  as permissive
  for delete
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all replies"
  on "public"."ticket_replies"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Customers can create replies on their tickets"
  on "public"."ticket_replies"
  as permissive
  for insert
  to public
with check (((ticket_id IN ( SELECT st.id
   FROM (public.support_tickets st
     JOIN public.customers c ON ((st.customer_id = c.id)))
  WHERE (c.user_id = auth.uid()))) OR public.has_role(auth.uid(), 'admin'::public.app_role)));



  create policy "Customers can view replies on their tickets"
  on "public"."ticket_replies"
  as permissive
  for select
  to public
using ((ticket_id IN ( SELECT st.id
   FROM (public.support_tickets st
     JOIN public.customers c ON ((st.customer_id = c.id)))
  WHERE (c.user_id = auth.uid()))));



  create policy "Admins can delete roles"
  on "public"."user_roles"
  as permissive
  for delete
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can insert roles"
  on "public"."user_roles"
  as permissive
  for insert
  to public
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can update roles"
  on "public"."user_roles"
  as permissive
  for update
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all roles"
  on "public"."user_roles"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Users can view their own role"
  on "public"."user_roles"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins can create vehicles"
  on "public"."vehicles"
  as permissive
  for insert
  to public
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all vehicles"
  on "public"."vehicles"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Customers can view their own vehicles"
  on "public"."vehicles"
  as permissive
  for select
  to public
using ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))));



  create policy "Admins can create VIN records"
  on "public"."vin_records"
  as permissive
  for insert
  to public
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can delete VIN records"
  on "public"."vin_records"
  as permissive
  for delete
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can update VIN records"
  on "public"."vin_records"
  as permissive
  for update
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all VIN records"
  on "public"."vin_records"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Customers can view their own VIN records"
  on "public"."vin_records"
  as permissive
  for select
  to public
using ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.user_id = auth.uid()))));



  create policy "Admins can create status updates"
  on "public"."vin_status_updates"
  as permissive
  for insert
  to public
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can delete status updates"
  on "public"."vin_status_updates"
  as permissive
  for delete
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can update status updates"
  on "public"."vin_status_updates"
  as permissive
  for update
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can view all status updates"
  on "public"."vin_status_updates"
  as permissive
  for select
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Customers can view their own VIN status updates"
  on "public"."vin_status_updates"
  as permissive
  for select
  to public
using ((vin_record_id IN ( SELECT vr.id
   FROM (public.vin_records vr
     JOIN public.customers c ON ((vr.customer_id = c.id)))
  WHERE (c.user_id = auth.uid()))));



  create policy "Admins can delete vehicles"
  on "public"."vehicles"
  as permissive
  for delete
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Admins can update vehicles"
  on "public"."vehicles"
  as permissive
  for update
  to public
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));


CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auction_vehicles_updated_at BEFORE UPDATE ON public.auction_vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_bid_outcome_notify AFTER UPDATE ON public.bid_requests FOR EACH ROW EXECUTE FUNCTION public.notify_bid_outcome();

CREATE TRIGGER on_bid_request_created AFTER INSERT ON public.bid_requests FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_bid_request();

CREATE TRIGGER on_bid_request_status_change AFTER UPDATE ON public.bid_requests FOR EACH ROW WHEN ((old.request_status IS DISTINCT FROM new.request_status)) EXECUTE FUNCTION public.notify_bid_outcome();

CREATE TRIGGER update_bid_requests_updated_at BEFORE UPDATE ON public.bid_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_document_upload_notify AFTER INSERT ON public.documents FOR EACH ROW EXECUTE FUNCTION public.notify_document_upload();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_new_public_quote AFTER INSERT ON public.public_quote_requests FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_quote();

CREATE TRIGGER on_public_quote_status_change AFTER UPDATE ON public.public_quote_requests FOR EACH ROW EXECUTE FUNCTION public.notify_public_quote_status_change();

CREATE TRIGGER update_public_quote_requests_updated_at BEFORE UPDATE ON public.public_quote_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_quote_response_notify AFTER UPDATE ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.notify_quote_response();

CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_new_support_ticket AFTER INSERT ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_ticket();

CREATE TRIGGER on_ticket_status_change AFTER UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.notify_ticket_status_change();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_ticket_reply AFTER INSERT ON public.ticket_replies FOR EACH ROW EXECUTE FUNCTION public.notify_customer_ticket_reply();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vin_records_updated_at BEFORE UPDATE ON public.vin_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_status_update_notify AFTER INSERT ON public.vin_status_updates FOR EACH ROW EXECUTE FUNCTION public.notify_status_update();

CREATE TRIGGER sync_vin_status_on_insert AFTER INSERT ON public.vin_status_updates FOR EACH ROW EXECUTE FUNCTION public.sync_vin_current_status();

CREATE TRIGGER sync_vin_status_on_update AFTER UPDATE OF status ON public.vin_status_updates FOR EACH ROW EXECUTE FUNCTION public.sync_vin_current_status();

CREATE TRIGGER trigger_sync_vin_current_status AFTER INSERT ON public.vin_status_updates FOR EACH ROW EXECUTE FUNCTION public.sync_vin_current_status();

drop trigger if exists "on_auth_user_created" on "auth"."users";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

drop policy "Admins can delete from vehicle-documents" on "storage"."objects";

drop policy "Admins can update vehicle-documents" on "storage"."objects";

drop policy "Anyone can view auction images" on "storage"."objects";

drop policy "Owners and admins can upload vehicle-documents" on "storage"."objects";

drop policy "Owners and admins can view vehicle-documents" on "storage"."objects";

drop policy "Admins can delete auction images" on "storage"."objects";

drop policy "Admins can update auction images" on "storage"."objects";

drop policy "Admins can upload auction images" on "storage"."objects";


  create policy "Admins can delete document files"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'documents'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));



  create policy "Admins can delete ticket attachments"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'ticket-attachments'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));



  create policy "Admins can upload documents"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'documents'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));



  create policy "Admins can view all document files"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'documents'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));



  create policy "Customers can upload attachments to their tickets"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'ticket-attachments'::text) AND ((EXISTS ( SELECT 1
   FROM (public.support_tickets st
     JOIN public.customers c ON ((st.customer_id = c.id)))
  WHERE ((c.user_id = auth.uid()) AND ((storage.foldername(objects.name))[1] = (st.id)::text)))) OR public.has_role(auth.uid(), 'admin'::public.app_role))));



  create policy "Customers can view their own document files"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'documents'::text) AND ((storage.foldername(name))[1] IN ( SELECT (vr.id)::text AS id
   FROM (public.vin_records vr
     JOIN public.customers c ON ((vr.customer_id = c.id)))
  WHERE (c.user_id = auth.uid())))));



  create policy "Public can view auction images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'auction-images'::text));



  create policy "Users can view attachments on their tickets"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'ticket-attachments'::text) AND ((EXISTS ( SELECT 1
   FROM (public.support_tickets st
     JOIN public.customers c ON ((st.customer_id = c.id)))
  WHERE ((c.user_id = auth.uid()) AND ((storage.foldername(objects.name))[1] = (st.id)::text)))) OR public.has_role(auth.uid(), 'admin'::public.app_role))));



  create policy "Admins can delete auction images"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'auction-images'::text) AND (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role))))));



  create policy "Admins can update auction images"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'auction-images'::text) AND (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role))))));



  create policy "Admins can upload auction images"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'auction-images'::text) AND (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role))))));



