-- ─────────────────────────────────────────────────────────────────────
-- PronostiGol HeredIA — Schema de Supabase
--
-- Cómo usarlo:
--   1. Abre tu proyecto en supabase.com.
--   2. SQL Editor → New query.
--   3. Pega TODO este archivo y dale Run.
--   4. Verifica en "Table Editor" que aparezca la tabla `predicciones`.
--
-- Lo que crea:
--   - Una tabla `predicciones` que guarda cada predicción generada
--     como JSON, con timestamp. Se guarda HISTORIAL (no se sobrescribe):
--     cada vez que regeneras una predicción para un partido se inserta
--     una fila nueva. La UI lee siempre la más reciente.
--   - Política de RLS: lectura pública (cualquiera con la anon key puede
--     leer), escritura sólo desde el backend con la service_role key.
-- ─────────────────────────────────────────────────────────────────────

create table if not exists predicciones (
  id           uuid        primary key default gen_random_uuid(),
  partido_id   text        not null,
  generada_en  timestamptz not null default now(),
  payload      jsonb       not null
);

-- Índice compuesto: las queries siempre filtran por partido y ordenan
-- por fecha descendente para traer la última.
create index if not exists predicciones_partido_fecha_idx
  on predicciones (partido_id, generada_en desc);

-- ─── Row Level Security ─────────────────────────────────────────────

alter table predicciones enable row level security;

-- Lectura pública. La anon key (visible en el frontend) puede SELECT.
drop policy if exists "lectura_publica_predicciones" on predicciones;
create policy "lectura_publica_predicciones"
  on predicciones for select
  using (true);

-- No definimos políticas de INSERT/UPDATE/DELETE.
-- Con RLS habilitada y sin políticas para esas operaciones, las anon keys
-- NO pueden escribir. Sólo el backend, usando la service_role key,
-- puede insertar (la service_role bypasea RLS por diseño de Supabase).
