alter table public.memberships
  add column if not exists payment_id text;

create unique index if not exists memberships_payment_id_unique
  on public.memberships (payment_id)
  where payment_id is not null;

create unique index if not exists orders_payment_id_unique
  on public.orders (payment_id)
  where payment_id is not null;

create unique index if not exists memberships_membership_id_unique
  on public.memberships (membership_id)
  where membership_id is not null;

create sequence if not exists public.standard_membership_number_seq;
create sequence if not exists public.premium_membership_number_seq;

do $$
declare
  standard_max bigint;
  premium_max bigint;
begin
  select max((regexp_match(membership_id, '^KB-ST-([0-9]+)$'))[1]::bigint)
    into standard_max
    from public.memberships;
  select max((regexp_match(membership_id, '^KB-PR-([0-9]+)$'))[1]::bigint)
    into premium_max
    from public.memberships;

  perform setval('public.standard_membership_number_seq', coalesce(standard_max, 1), standard_max is not null);
  perform setval('public.premium_membership_number_seq', coalesce(premium_max, 1), premium_max is not null);
end;
$$;

create or replace function public.assign_membership_number()
returns trigger
language plpgsql
as $$
declare
  selected_plan_name text;
begin
  if new.membership_id is not null and btrim(new.membership_id) <> '' then
    return new;
  end if;

  select name into selected_plan_name
    from public.membership_plans
    where id = new.plan_id;

  if lower(coalesce(selected_plan_name, '')) like '%premium%' then
    new.membership_id := 'KB-PR-' || lpad(nextval('public.premium_membership_number_seq')::text, 4, '0');
  else
    new.membership_id := 'KB-ST-' || lpad(nextval('public.standard_membership_number_seq')::text, 4, '0');
  end if;

  return new;
end;
$$;

alter table public.orders
  add column if not exists shipping_method text,
  add column if not exists subtotal_amount numeric(10, 2) not null default 0,
  add column if not exists discount_amount numeric(10, 2) not null default 0,
  add column if not exists courier_discount numeric(10, 2) not null default 0;

alter table public.orders alter column status drop default;
alter table public.orders alter column status type text using status::text;
alter table public.orders alter column status set default 'pending';

do $$
declare
  check_constraint record;
begin
  for check_constraint in
    select conname
      from pg_constraint
      where conrelid = 'public.orders'::regclass
        and contype = 'c'
        and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.orders drop constraint %I', check_constraint.conname);
  end loop;
end;
$$;

alter table public.orders
  add constraint orders_fulfillment_status_check
  check (status in ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'));