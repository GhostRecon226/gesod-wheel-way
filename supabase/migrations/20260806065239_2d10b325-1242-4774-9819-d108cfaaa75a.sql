CREATE OR REPLACE FUNCTION public.track_vehicle_by_vin(_vin text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.track_vehicle_by_vin(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_vehicle_by_vin(text) TO anon, authenticated, service_role;