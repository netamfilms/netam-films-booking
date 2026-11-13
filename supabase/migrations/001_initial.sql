create extension if not exists pgcrypto;

create table if not exists public.services (
 id uuid primary key default gen_random_uuid(),
 key text unique not null,
 name text not null,
 unit text not null,
 price integer not null default 0 check(price>=0),
 kind text not null check(kind in ('quantity_days','days','quantity','quote')),
 active boolean not null default true,
 sort_order integer not null default 0,
 created_at timestamptz not null default now()
);

insert into public.services(key,name,unit,price,kind,sort_order) values
 ('photography','Photography / Camera Unit','per unit / day',3000,'quantity_days',1),
 ('cinematic','Cinematic Video (15-minute film)','per day',4000,'days',2),
 ('traditional','Traditional Video','price on request',0,'quote',3),
 ('drone','Drone Shooting','per day',4000,'days',4),
 ('editing','Video Mixing / Editing','market-based',0,'quote',5),
 ('photo_sheet','Photo Sheet','per sheet',120,'quantity',6)
on conflict(key) do nothing;

create table if not exists public.bookings (
 id uuid primary key default gen_random_uuid(),
 customer_name text not null,
 phone text not null,
 event_date date not null,
 event_type text not null,
 photographers integer not null default 0,
 videographers integer not null default 0,
 camera_units integer not null default 0,
 event_days integer not null default 1,
 selected_services jsonb not null default '[]',
 cinematic_days integer not null default 0,
 drone_days integer not null default 0,
 photo_sheets integer not null default 0,
 schedule text not null default '',
 venue text not null,
 requirements text not null default '',
 estimate_total integer not null default 0,
 advance_due integer not null default 0,
 balance_due integer not null default 0,
 payment_method text not null check(payment_method in ('upi','cash')),
 booking_status text not null default 'pending_review' check(booking_status in ('pending_review','confirmed','rejected','completed')),
 payment_status text not null default 'advance_pending' check(payment_status in ('advance_pending','paid','partial','fully_paid')),
 advance_paid_at timestamptz,
 created_at timestamptz not null default now()
);

create table if not exists public.payments (
 id uuid primary key default gen_random_uuid(),
 booking_id uuid not null references public.bookings(id) on delete cascade,
 provider text not null,
 provider_order_id text unique,
 provider_payment_id text,
 amount integer not null,
 status text not null default 'created',
 verified_at timestamptz,
 created_at timestamptz not null default now()
);

-- Private tables: browser clients cannot read or mutate booking/payment records.
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.services enable row level security;
create policy "Public can read active services" on public.services for select using (active=true);
-- All writes/booking reads happen through server routes using the service-role key.
-- Never expose SUPABASE_SERVICE_ROLE_KEY in client-side code.

-- Availability baseline: admin must review overlaps before confirming.
-- For production resource allocation, add per-resource capacity and a transactional
-- availability RPC before enabling automatic confirmations.
create index if not exists bookings_event_date_idx on public.bookings(event_date);
create index if not exists bookings_status_date_idx on public.bookings(booking_status,event_date);
create index if not exists payments_booking_idx on public.payments(booking_id);


-- Conservative double-booking guard: a date range can only have one confirmed
-- booking until the studio configures its actual team/equipment capacities.
-- The advisory transaction lock prevents two admins confirming the same slot at once.
create or replace function public.confirm_booking(booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
 target public.bookings;
 conflict_count integer;
begin
 perform pg_advisory_xact_lock(hashtext('netam_booking_confirmation'));
 select * into target from public.bookings where id=booking_id for update;
 if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
 select count(*) into conflict_count from public.bookings b
 where b.id<>target.id and b.booking_status='confirmed'
 and daterange(b.event_date,b.event_date + greatest(b.event_days,1),'[)')
     && daterange(target.event_date,target.event_date + greatest(target.event_days,1),'[)');
 if conflict_count>0 then raise exception 'DATE_CONFLICT'; end if;
 update public.bookings set booking_status='confirmed' where id=booking_id returning * into target;
 return target;
end;
$$;
revoke all on function public.confirm_booking(uuid) from public, anon, authenticated;
grant execute on function public.confirm_booking(uuid) to service_role;
