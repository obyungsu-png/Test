// 교사·강사 자료 파일 저장소 (Supabase Storage)
//
// HTML 보조자료와 같은 방식: 자료 목록(lms/materials)에는 제목·탭 같은 정보와 파일 주소만 두고,
// PDF·Word·PowerPoint·한글 파일은 이 저장소에 하나씩 따로 저장한다.
//
// 최초 1회 Supabase SQL Editor 에서 TEACHER_STORAGE_SETUP_SQL 을 실행해야 한다.
// (supabase/sql/teacher_materials_storage.sql 과 같은 내용)

import { supabase } from "./supabase/client";
import { projectId } from "./supabase/info";

export const TEACHER_BUCKET = "teacher-materials";
export const MAX_TEACHER_FILE_BYTES = 50 * 1024 * 1024;

/** 확장자 → 저장할 파일 형식 (저장소는 이 형식만 받음) */
const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  hwp: "application/x-hwp",
  hwpx: "application/x-hwp",
};

export const PDF_ACCEPT = ".pdf";
export const ORIGINAL_ACCEPT = ".doc,.docx,.ppt,.pptx,.hwp,.hwpx";

const extOf = (name: string) => name.split(".").pop()?.toLowerCase() || "";
export const isPdfName = (name: string) => extOf(name) === "pdf";
export const isOriginalName = (name: string) => ["doc", "docx", "ppt", "pptx", "hwp", "hwpx"].includes(extOf(name));
export const mimeOf = (name: string) => MIME_BY_EXT[extOf(name)] || "application/octet-stream";

/** 저장소 준비 SQL — 관리자 안내 화면의 '복사' 버튼에서도 사용 */
export const TEACHER_STORAGE_SETUP_SQL = `-- AllMyExam: 교사·강사 자료 파일 저장소 (한 번만 실행)
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
`;

const PUBLIC_BASE = `https://${projectId}.supabase.co/storage/v1/object/public/${TEACHER_BUCKET}/`;

export type TeacherStorageStatus = "ready" | "missing" | "unknown";

/** 저장소(버킷)가 만들어졌는지 확인 — 읽기만 한다 */
export async function checkTeacherStorage(): Promise<TeacherStorageStatus> {
  try {
    const res = await fetch(`${PUBLIC_BASE}ready-check.txt`, { cache: "no-store" });
    if (res.ok) return "ready";
    const text = await res.text();
    return /Bucket not found|NoSuchBucket/i.test(text) ? "missing" : "ready";
  } catch {
    return "unknown";
  }
}

function describeStorageError(error: any): string {
  const msg = String(error?.message || error || "");
  if (/Bucket not found|NoSuchBucket/i.test(msg)) return "파일 저장소가 아직 없습니다. Supabase 설정(SQL)을 먼저 실행해 주세요.";
  if (/row-level security|policy|Unauthorized|permission|403/i.test(msg)) return "파일 저장소 업로드 권한이 없습니다. Supabase 설정(SQL)을 다시 실행해 주세요.";
  if (/maximum allowed size|too large|413/i.test(msg)) return "파일이 너무 큽니다 (최대 50MB).";
  if (/mime/i.test(msg)) return "허용되지 않는 파일 형식입니다. (PDF·Word·PowerPoint·한글)";
  return msg || "파일 저장소 오류";
}

/** 파일을 저장소에 올리고 공개 주소를 돌려준다 */
export async function uploadTeacherFile(id: string, file: File): Promise<{ url: string; path: string }> {
  const path = `${id}.${extOf(file.name) || "bin"}`;
  const { error } = await supabase.storage
    .from(TEACHER_BUCKET)
    .upload(path, file, { contentType: mimeOf(file.name), cacheControl: "31536000", upsert: false });
  if (error) throw new Error(describeStorageError(error));
  const { data } = supabase.storage.from(TEACHER_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** 저장소의 파일 삭제 (실패해도 자료 삭제는 진행) */
export async function removeTeacherFiles(paths: (string | undefined)[]): Promise<void> {
  const list = paths.filter((p): p is string => !!p);
  if (list.length === 0) return;
  try {
    const { error } = await supabase.storage.from(TEACHER_BUCKET).remove(list);
    if (error) console.warn("[teacherStorage] remove failed:", error.message);
  } catch (err) {
    console.warn("[teacherStorage] remove failed:", err);
  }
}

export const newTeacherMaterialId = () => `teacher-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
