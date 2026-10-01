update public.membership_plans
set price = 699,
    discount_percentage = 15,
    validity_days = 350,
    updated_at = now()
where lower(name) like '%standard%';

update public.membership_plans
set discount_percentage = 20,
    validity_days = 350,
    updated_at = now()
where lower(name) like '%premium%';