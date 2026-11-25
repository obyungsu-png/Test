-- AllMyExam: 교사·강사 자료 파일 저장소 (한 번만 실행)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('teacher-materials', 'teacher-materials', true, 52428800, array[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/x-hwp'
])
on conflict (id) do update
  set public = true, file_size_limit = 52428800, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "teacher-materials read" on storage.objects;
drop policy if exists "teacher-materials upload" on storage.objects;
drop policy if exists "teacher-materials delete" on storage.objects;

create policy "teacher-materials read" on storage.objects
  for select using (bucket_id = 'teacher-materials');
create policy "teacher-materials upload" on storage.objects
  for insert with check (bucket_id = 'teacher-materials');
create policy "teacher-materials delete" on storage.objects
  for delete using (bucket_id = 'teacher-materials');
