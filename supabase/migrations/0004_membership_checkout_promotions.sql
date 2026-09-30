alter table public.offers
  add column if not exists coupon_code text;

create unique index if not exists offers_coupon_code_lower_unique
  on public.offers (lower(coupon_code))
  where coupon_code is not null and coupon_code <> '';

create sequence if not exists public.membership_number_seq;

do $$
declare
  current_max bigint;
begin
  select max((regexp_match(membership_id, '-([0-9]+)$'))[1]::bigint)
    into current_max
    from public.memberships
    where membership_id ~ '^KBM-[0-9]{4}-[0-9]+$';

  if current_max is not null then
    perform setval('public.membership_number_seq', current_max, true);
  end if;
end;
$$;

create or replace function public.assign_membership_number()
returns trigger
language plpgsql
as $$
begin
  if new.membership_id is null or btrim(new.membership_id) = '' then
    new.membership_id := 'KBM-' || to_char(current_date, 'YYYY') || '-'
      || lpad(nextval('public.membership_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists memberships_assign_membership_number
  on public.memberships;

create trigger memberships_assign_membership_number
before insert on public.memberships
for each row
execute function public.assign_membership_number();