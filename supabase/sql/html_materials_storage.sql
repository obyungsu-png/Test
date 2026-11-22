-- AllMyExam: HTML 보조자료 파일 저장소 (한 번만 실행)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('html-materials', 'html-materials', true, 5242880, array['text/plain'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880, allowed_mime_types = array['text/plain'];

drop policy if exists "html-materials read" on storage.objects;
drop policy if exists "html-materials upload" on storage.objects;
drop policy if exists "html-materials delete" on storage.objects;

create policy "html-materials read" on storage.objects
  for select using (bucket_id = 'html-materials');
create policy "html-materials upload" on storage.objects
  for insert with check (bucket_id = 'html-materials');
create policy "html-materials delete" on storage.objects
  for delete using (bucket_id = 'html-materials');
