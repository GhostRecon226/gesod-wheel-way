CREATE OR REPLACE FUNCTION public.email_queue_dispatch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.email_queue_url', true),
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.email_queue_wake()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.email_queue_dispatch();
END;
$$;
