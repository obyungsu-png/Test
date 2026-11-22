// HTML 보조자료 파일 저장소 (Supabase Storage)
//
// 자료 목록(lms/materials)에는 제목·학년 같은 정보와 파일 주소만 두고,
// HTML 파일 자체는 이 저장소에 하나씩 따로 저장한다.
// → 목록이 가벼워지고(자료당 1KB 미만), 파일은 START 를 누를 때 그 하나만 내려받는다.
//
// 최초 1회 Supabase SQL Editor 에서 HTML_STORAGE_SETUP_SQL 을 실행해야 한다.
// (supabase/sql/html_materials_storage.sql 과 같은 내용)

import { supabase } from "./supabase/client";
import { projectId } from "./supabase/info";

export const HTML_BUCKET = "html-materials";

/** 저장소 준비 SQL — CMS 안내 화면의 '복사' 버튼에서도 사용 */
export const HTML_STORAGE_SETUP_SQL = `-- AllMyExam: HTML 보조자료 파일 저장소 (한 번만 실행)
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
`;

export const SUPABASE_SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${projectId}/sql/new`;

const PUBLIC_BASE = `https://${projectId}.supabase.co/storage/v1/object/public/${HTML_BUCKET}/`;

export type HtmlStorageStatus = "ready" | "missing" | "unknown";

/** 저장소(버킷)가 만들어졌는지 확인 — 읽기만 한다 */
export async function checkHtmlStorage(): Promise<HtmlStorageStatus> {
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
  if (/maximum allowed size|too large|413/i.test(msg)) return "파일이 너무 큽니다 (최대 5MB).";
  if (/mime/i.test(msg)) return "허용되지 않는 파일 형식입니다.";
  return msg || "파일 저장소 오류";
}

/**
 * HTML 파일을 저장소에 올리고 공개 주소를 돌려준다.
 * text/plain 으로 저장해 저장소 주소에서는 HTML 이 실행되지 않고, 사이트의 START 플레이어에서만 실행된다.
 */
export async function uploadHtmlFile(id: string, file: Blob): Promise<{ url: string; path: string }> {
  const path = `html/${id}.html`;
  const body = new Blob([file], { type: "text/plain" });
  const { error } = await supabase.storage
    .from(HTML_BUCKET)
    .upload(path, body, { contentType: "text/plain", cacheControl: "31536000", upsert: false });
  if (error) throw new Error(describeStorageError(error));
  const { data } = supabase.storage.from(HTML_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** 저장소의 파일 삭제 (실패해도 자료 삭제는 진행) */
export async function removeHtmlFile(path?: string): Promise<void> {
  if (!path) return;
  try {
    const { error } = await supabase.storage.from(HTML_BUCKET).remove([path]);
    if (error) console.warn("[htmlStorage] remove failed:", error.message);
  } catch (err) {
    console.warn("[htmlStorage] remove failed:", err);
  }
}

export const newHtmlMaterialId = () => `html-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
