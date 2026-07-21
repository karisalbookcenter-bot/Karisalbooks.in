-- ============================================================================
-- KarisalBooks.in — Migration 0003
-- Scope: a second Storage bucket, for author photos, ONLY.
--
-- Context: Sprint 11 reuses Sprint 10's Image Upload Service for
-- `authors.photo_url` (Requirements: "Reuse existing: ... Image Upload
-- Service. Never duplicate code."). That service is bucket-parameterized
-- (see `image-upload.service.ts`'s Sprint 11 update), so it needs a second
-- bucket to upload into — this migration adds exactly that, following
-- Migration 0002's own Storage section pattern verbatim. No table is
-- created or altered.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('author-photos', 'author-photos', true)
on conflict (id) do nothing;

create policy "Public can view author photos"
  on storage.objects for select
  using (bucket_id = 'author-photos');

create policy "Public can upload author photos"
  on storage.objects for insert
  with check (bucket_id = 'author-photos');

-- storage.objects RLS is already disabled project-wide by Migration 0002;
-- no further `alter table` is needed here.

-- ============================================================================
-- End of Migration 0003
-- ============================================================================
