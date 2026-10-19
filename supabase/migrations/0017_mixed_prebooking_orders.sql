alter table public.orders
  drop constraint if exists orders_purchase_type_check;

alter table public.orders
  add constraint orders_purchase_type_check
  check (purchase_type in ('books', 'prebooking', 'customize', 'mixed'));

create or replace function public.assign_prebooking_reference()
returns trigger
language plpgsql
as $$
begin
  if new.purchase_type in ('prebooking', 'mixed')
    and new.prebooking_id is null then
    new.prebooking_id := 'KB-PB-' ||
      lpad(nextval('public.prebooking_reference_seq')::text, 7, '0');
  end if;
  return new;
end;
$$;
