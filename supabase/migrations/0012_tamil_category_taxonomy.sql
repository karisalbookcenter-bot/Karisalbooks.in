-- Add Tamil literature, politics, history, and criticism categories.
-- The categories table supports nested categories, including the Tamil Nadu
-- history topics beneath the Tamil Nadu history category.

insert into categories (name, slug)
values
  ('குழந்தை இலக்கியம்', 'childrens-literature'),
  ('அரசியல்', 'politics'),
  ('வரலாறு', 'history'),
  ('விமர்சனம்', 'criticism')
on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
select child.name, child.slug, parent.id
from (values
  ('politics', 'உலக அரசியல்', 'world-politics'),
  ('politics', 'தமிழ்நாடு', 'tamil-nadu-politics'),
  ('history', 'இந்திய வரலாறு', 'indian-history'),
  ('history', 'தமிழக வரலாறு', 'tamil-nadu-history'),
  ('history', 'உலக வரலாறு', 'world-history'),
  ('criticism', 'இலக்கியம்', 'literary-criticism'),
  ('criticism', 'அரசியல்', 'political-criticism'),
  ('criticism', 'மொழி', 'language-criticism')
) as child(parent_slug, name, slug)
join categories parent on parent.slug = child.parent_slug
on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
select topic.name, topic.slug, parent.id
from (values
  ('சங்க காலம்', 'sangam-period'),
  ('இடைக்காலம்', 'medieval-period'),
  ('நவீன காலம்', 'modern-period'),
  ('பண்பாட்டு வரலாறு', 'cultural-history'),
  ('இலக்கிய வரலாறு', 'literary-history'),
  ('ஆய்வுகள்', 'historical-research')
) as topic(name, slug)
join categories parent on parent.slug = 'tamil-nadu-history'
on conflict (slug) do nothing;