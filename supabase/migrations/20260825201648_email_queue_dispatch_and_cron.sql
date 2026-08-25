-- Restores the pg_cron-driven email dispatch mechanism referenced by the
-- REVOKE/GRANT statements in 20260806064104 but never captured in a tracked
-- migration. email_queue_dispatch()/email_queue_wake() were lost entirely
-- (no source recoverable); this recreates them from scratch based on the
-- existing email_send_state cooldown design and the pgmq queues already
-- set up in 20260403061223_email_infra.sql.
--
-- The actual vault secret ('email_queue_service_role_key') is NOT set here —
-- it's a live credential and must be added separately via
-- vault.create_secret with the project's real service_role key.

-- email_queue_dispatch(): the periodic dispatcher, invoked by pg_cron every
-- 5 seconds. Skips the HTTP call when there's an active Retry-After
-- cooldown or when both queues are empty, so idle periods don't spam the
-- edge function.
CREATE OR REPLACE FUNCTION public.email_queue_dispatch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_retry_until timestamptz;
  v_pending bigint;
  v_service_key text;
BEGIN
  SELECT retry_after_until INTO v_retry_until FROM public.email_send_state WHERE id = 1;
  IF v_retry_until IS NOT NULL AND v_retry_until > now() THEN
    RETURN;
  END IF;

  SELECT (SELECT count(*) FROM pgmq.q_auth_emails) + (SELECT count(*) FROM pgmq.q_transactional_emails)
    INTO v_pending;
  IF COALESCE(v_pending, 0) = 0 THEN
    RETURN;
  END IF;

  SELECT decrypted_secret INTO v_service_key
  FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;
  IF v_service_key IS NULL THEN
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := 'https://zzqeugfhrubepqkwzkkn.supabase.co/functions/v1/process-email-queue',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_service_key),
    body := '{}'::jsonb
  );
END;
$$;

REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;

-- email_queue_wake(): an immediate, on-demand nudge using the same dispatch
-- mechanism, minus the queue-depth check — for callers that already know a
-- message was just enqueued and want it sent without waiting for the next
-- cron tick. Still respects the rate-limit cooldown.
CREATE OR REPLACE FUNCTION public.email_queue_wake()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_retry_until timestamptz;
  v_service_key text;
BEGIN
  SELECT retry_after_until INTO v_retry_until FROM public.email_send_state WHERE id = 1;
  IF v_retry_until IS NOT NULL AND v_retry_until > now() THEN
    RETURN;
  END IF;

  SELECT decrypted_secret INTO v_service_key
  FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;
  IF v_service_key IS NULL THEN
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := 'https://zzqeugfhrubepqkwzkkn.supabase.co/functions/v1/process-email-queue',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_service_key),
    body := '{}'::jsonb
  );
END;
$$;

REVOKE ALL ON FUNCTION public.email_queue_wake() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_queue_wake() TO service_role;

-- pg_cron job: call email_queue_dispatch() every 5 seconds. Unschedule
-- first so re-running this migration doesn't create a duplicate job.
DO $$
BEGIN
  PERFORM cron.unschedule('process-email-queue');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'process-email-queue',
  '5 seconds',
  $$SELECT public.email_queue_dispatch();$$
);
