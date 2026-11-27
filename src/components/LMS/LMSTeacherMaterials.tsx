import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Copy, ExternalLink, FileCode2, FileText, Presentation, RefreshCw, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { saveMaterialsStrict } from "../utils/dataManager";
import * as lmsApi from "../../utils/lmsApi";
import {
  TEACHER_AREAS,
  TEACHER_FILE_TABS,
  TEACHER_SUBJECT,
  TEACHER_TAB_INFO,
  parseTeacherCategory,
  teacherScopeLabel,
  teacherScopeOptions,
} from "../constants/teacherTabs";
import { MAX_HTML_BYTES, extractHtmlTitle, isHtmlFile } from "../utils/interactiveHtml";
import {
  HTML_BUCKET,
  HTML_STORAGE_SETUP_SQL,
  SUPABASE_SQL_EDITOR_URL,
  checkHtmlStorage,
  removeHtmlFile,
  uploadHtmlFile,
} from "../../utils/htmlMaterialStorage";
import {
  MAX_TEACHER_FILE_BYTES,
  ORIGINAL_ACCEPT,
  PDF_ACCEPT,
  TEACHER_BUCKET,
  TEACHER_STORAGE_SETUP_SQL,
  checkTeacherStorage,
  isOriginalName,
  isPdfName,
  mimeOf,
  newTeacherMaterialId,
  removeTeacherFiles,
  uploadTeacherFile,
} from "../../utils/teacherFileStorage";

type StorageStatus = "ready" | "missing" | "unknown" | "checking";
type Format = "document" | "html";

const isTeacherMaterial = (m: any) => m?.subject === TEACHER_SUBJECT && m?.schoolType === "korean";

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const fileKindLabel = (name = "") => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (ext === "html" || ext === "htm") return "HTML";
  if (ext === "ppt" || ext === "pptx") return "PowerPoint";
  if (ext === "hwp" || ext === "hwpx") return "한글";
  return "Word";
};

const scopeOf = (category: string) => {
  const scope = parseTeacherCategory(category);
  return scope ? `${scope.area} · ${teacherScopeLabel(scope)}` : category;
};

/**
 * CMS > 교사·강사 자료
 * 한국학교 > 교사·강사 과목의 탭(수업 자료·정답·해설·평가·문제은행·숙제·과제)에 자료를 올린다.
 * - 문서: PDF 는 시험보기·PDF 다운로드, 원본(Word·PowerPoint·한글)은 편집용 다운로드 (교사·강사 파일 저장소)
 * - HTML 활동: CSS·JS 가 들어간 .html — 사이트에서 START 로 전체화면 실행 (HTML 보조자료 저장소)
 * - 대상 학년: 전 학년 / 학교급 전체 / 한 학년 (학년을 고른 선생님께는 그 학교급 전체·전 학년 자료도 함께 보임)
 * 파일은 Supabase 파일 저장소에 따로 저장하고, 자료 목록에는 주소만 남긴다.
 */
export default function LMSTeacherMaterials() {
  const [tab, setTab] = useState(TEACHER_FILE_TABS[0]);
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");
  const [format, setFormat] = useState<Format>("document");
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [docStorage, setDocStorage] = useState<StorageStatus>("checking");
  const [htmlStorage, setHtmlStorage] = useState<StorageStatus>("checking");

  const refreshStorage = async () => {
    setDocStorage("checking");
    setHtmlStorage("checking");
    const [doc, html] = await Promise.all([checkTeacherStorage(), checkHtmlStorage()]);
    setDocStorage(doc);
    setHtmlStorage(html);
  };

  const loadMaterials = async () => {
    try {
      lmsApi.invalidateCache("materials");
      const all = await lmsApi.fetchMaterials();
      setMaterials(all.filter(isTeacherMaterial));
      setListError(null);
    } catch (err: any) {
      setListError(err?.message || "자료 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    refreshStorage();
    loadMaterials();
  }, []);

  const byTab = useMemo(() => {
    const map = new Map<string, any[]>(TEACHER_FILE_TABS.map((t) => [t, []]));
    for (const m of materials) map.get(m.contentType)?.push(m);
    return map;
  }, [materials]);

  const storage = format === "html" ? htmlStorage : docStorage;
  const setupSql = format === "html" ? HTML_STORAGE_SETUP_SQL : TEACHER_STORAGE_SETUP_SQL;

  const resetFiles = () => {
    setPdfFile(null);
    setOriginalFile(null);
    setHtmlFile(null);
    setInputKey((k) => k + 1);
  };

  const pickFile = async (file: File | null, kind: "pdf" | "original" | "html") => {
    if (!file) {
      if (kind === "pdf") setPdfFile(null);
      else if (kind === "original") setOriginalFile(null);
      else setHtmlFile(null);
      return;
    }
    const valid = kind === "pdf" ? isPdfName(file.name) : kind === "original" ? isOriginalName(file.name) : isHtmlFile({ fileName: file.name, fileType: file.type });
    if (!valid) {
      toast.error(kind === "pdf" ? "PDF 파일만 올릴 수 있습니다." : kind === "original" ? "Word·PowerPoint·한글 파일만 올릴 수 있습니다." : ".html 파일만 올릴 수 있습니다.");
      setInputKey((k) => k + 1);
      return;
    }
    const limit = kind === "html" ? MAX_HTML_BYTES : MAX_TEACHER_FILE_BYTES;
    if (file.size > limit) {
      toast.error(`파일이 너무 큽니다 (최대 ${formatSize(limit)}).`);
      setInputKey((k) => k + 1);
      return;
    }
    if (kind === "pdf") setPdfFile(file);
    else if (kind === "original") setOriginalFile(file);
    else setHtmlFile(file);
    if (!title.trim()) {
      const fromHtml = kind === "html" ? extractHtmlTitle(await file.text().catch(() => "")) : "";
      setTitle(fromHtml || file.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!area || !category) return toast.error("과목과 대상 학년을 선택해 주세요.");
    const mainFile = format === "html" ? htmlFile : pdfFile || originalFile;
    if (!mainFile) return toast.error(format === "html" ? "HTML 파일을 선택해 주세요." : "PDF 또는 원본 파일을 하나 이상 선택해 주세요.");
    const finalTitle = title.trim() || mainFile.name;
    const id = newTeacherMaterialId();
    const now = new Date().toISOString();
    const uploaded: { bucket: string; path: string }[] = [];
    setSaving(true);
    try {
      // ① 파일은 파일 저장소에 따로
      const docInfo = async (file: File, suffix: string) => {
        const { url, path } = await uploadTeacherFile(`${id}-${suffix}`, file);
        uploaded.push({ bucket: TEACHER_BUCKET, path });
        return { fileName: file.name, fileType: mimeOf(file.name), fileData: url, fileSize: file.size, storageBucket: TEACHER_BUCKET, storagePath: path, uploadDate: now };
      };
      let uploadData: any;
      let wordFile: any = null;
      if (format === "html") {
        const { url, path } = await uploadHtmlFile(id, htmlFile!);
        uploaded.push({ bucket: HTML_BUCKET, path });
        uploadData = { fileName: htmlFile!.name, fileType: "text/html", fileData: url, fileSize: htmlFile!.size, storageBucket: HTML_BUCKET, storagePath: path, uploadDate: now };
      } else {
        const pdf = pdfFile ? await docInfo(pdfFile, "pdf") : null;
        const original = originalFile ? await docInfo(originalFile, "original") : null;
        // PDF 가 있으면 PDF 가 본 파일(시험보기), 원본은 편집용 다운로드
        uploadData = pdf || original;
        if (pdf && original) wordFile = original;
      }
      // ② 자료 목록에는 정보와 주소만
      const record = {
        id,
        title: finalTitle,
        description: TEACHER_TAB_INFO[tab]?.description || tab,
        subject: TEACHER_SUBJECT,
        level: area,
        category,
        schoolType: "korean",
        contentType: tab,
        uploadDate: now,
        password: "",
        downloadCount: 0,
        fileSize: formatSize(format === "html" ? htmlFile!.size : (pdfFile?.size || 0) + (originalFile?.size || 0)),
        isUploaded: true,
        source: "content-management",
        uploadData,
        ...(wordFile ? { wordFile } : {}),
      };
      const next = await saveMaterialsStrict((list) => [...list, record as any]);
      setMaterials(next.filter(isTeacherMaterial));
      toast.success(`"${finalTitle}" 업로드 완료`, { description: `교사·강사 › ${tab} › ${scopeOf(category)}` });
      setTitle("");
      resetFiles();
    } catch (err: any) {
      console.error(err);
      // 목록 저장 실패 시 올린 파일 정리
      for (const f of uploaded) {
        if (f.bucket === HTML_BUCKET) removeHtmlFile(f.path);
        else removeTeacherFiles([f.path]);
      }
      toast.error("업로드하지 못했습니다", { description: err?.message || String(err), duration: 10000 });
      if (/저장소가 아직 없습니다/.test(err?.message || "")) {
        if (format === "html") setHtmlStorage("missing");
        else setDocStorage("missing");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m: any) => {
    if (!window.confirm(`"${m.title}" 자료를 삭제할까요? 사이트에서도 사라집니다.`)) return;
    try {
      const next = await saveMaterialsStrict((list) => list.filter((x: any) => x.id !== m.id));
      setMaterials(next.filter(isTeacherMaterial));
      for (const f of [m.uploadData, m.wordFile]) {
        if (!f?.storagePath) continue;
        if (f.storageBucket === HTML_BUCKET) await removeHtmlFile(f.storagePath);
        else await removeTeacherFiles([f.storagePath]);
      }
      toast.success("삭제했습니다.");
    } catch (err: any) {
      toast.error("삭제하지 못했습니다", { description: err?.message || String(err) });
    }
  };

  const copySetupSql = async () => {
    try {
      await navigator.clipboard.writeText(setupSql);
      toast.success("SQL 을 복사했습니다. Supabase SQL Editor 에 붙여 넣고 Run 을 누르세요.");
    } catch {
      toast.error("복사하지 못했습니다. 아래 SQL 을 직접 선택해 복사해 주세요.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
          <Presentation className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">교사·강사 자료</h1>
          <p className="text-sm text-gray-500">
            사이트 › 한국학교 › 교사·강사 탭에 올라갑니다. SGR 수업 교재는 SGR 관리 메뉴에서 관리하세요.
          </p>
        </div>
      </div>

      {/* 파일 저장소 최초 설정 안내 (고른 자료 형식의 저장소) */}
      {storage === "missing" && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 space-y-1">
                <p className="font-semibold">{format === "html" ? "HTML 파일 저장소" : "교사·강사 파일 저장소"} 설정이 한 번 필요합니다</p>
                <p>
                  파일은 자료 목록과 따로 Supabase 파일 저장소에 저장합니다. 아래 SQL 을 복사해 Supabase <b>SQL Editor</b> 에
                  붙여 넣고 <b>Run</b> 을 누른 뒤, <b>다시 확인</b>을 눌러 주세요.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={copySetupSql} style={{ backgroundColor: "#00bcd4", color: "white" }}>
                <Copy className="w-4 h-4 mr-1.5" /> SQL 복사
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.open(SUPABASE_SQL_EDITOR_URL, "_blank", "noopener")}>
                <ExternalLink className="w-4 h-4 mr-1.5" /> Supabase SQL Editor 열기
              </Button>
              <Button size="sm" variant="outline" onClick={refreshStorage}>
                <RefreshCw className="w-4 h-4 mr-1.5" /> 다시 확인
              </Button>
            </div>
            <pre className="text-[11px] leading-relaxed bg-white border border-amber-200 rounded p-3 overflow-x-auto whitespace-pre select-all">
{setupSql}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* 업로드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Upload className="w-5 h-5 mr-2" style={{ color: "#00bcd4" }} />
            자료 올리기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">탭</label>
              <Select value={tab} onValueChange={setTab}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEACHER_FILE_TABS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">과목</label>
              <Select value={area} onValueChange={(v) => { setArea(v); setCategory(""); }}>
                <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                <SelectContent>
                  {TEACHER_AREAS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">대상 학년</label>
              <Select value={category} onValueChange={setCategory} disabled={!area}>
                <SelectTrigger><SelectValue placeholder={area ? "선택" : "과목을 먼저 선택"} /></SelectTrigger>
                <SelectContent>
                  {(area ? teacherScopeOptions(area) : []).map((o) => (
                    <SelectItem key={o.category} value={o.category}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {TEACHER_TAB_INFO[tab] && <>{TEACHER_TAB_INFO[tab].description} — 예: {TEACHER_TAB_INFO[tab].examples.join(", ")}. </>}
            대상 학년: <b>전 학년</b>은 모든 학년에서, <b>초등 전체</b>는 초등 모든 학년에서, <b>초등 3학년</b>은 초3에서 보입니다.
          </p>

          {/* 자료 형식 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">자료 형식</label>
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              {([
                ["document", "문서 (PDF·Word·PowerPoint·한글)"],
                ["html", "HTML 활동 (CSS·JS 포함)"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setFormat(value); resetFiles(); }}
                  aria-pressed={format === value}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${format === value ? "bg-white text-cyan-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">제목</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="비워 두면 파일 이름(HTML 은 페이지 제목)으로 저장" />
          </div>
          {format === "document" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" key={`doc-${inputKey}`}>
              <div className="rounded-lg border border-gray-200 p-3">
                <label className="block text-sm font-medium text-gray-700">PDF 파일</label>
                <p className="text-xs text-gray-500 mb-2">사이트의 시험보기(필기 가능)·PDF 다운로드에 사용</p>
                <input type="file" accept={PDF_ACCEPT} onChange={(e) => pickFile(e.target.files?.[0] || null, "pdf")} className="block w-full text-sm" />
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <label className="block text-sm font-medium text-gray-700">편집용 원본 (선택)</label>
                <p className="text-xs text-gray-500 mb-2">Word·PowerPoint·한글 — 선생님이 고쳐 쓰는 파일</p>
                <input type="file" accept={ORIGINAL_ACCEPT} onChange={(e) => pickFile(e.target.files?.[0] || null, "original")} className="block w-full text-sm" />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 p-3" key={`html-${inputKey}`}>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <FileCode2 className="w-4 h-4 text-cyan-600" /> HTML 파일
              </label>
              <p className="text-xs text-gray-500 mb-2">
                CSS·JS 를 한 파일 안에 넣은 .html (최대 {formatSize(MAX_HTML_BYTES)}) — 사이트에서 START 버튼으로 전체화면 실행
              </p>
              <input type="file" accept=".html,.htm" onChange={(e) => pickFile(e.target.files?.[0] || null, "html")} className="block w-full text-sm" />
            </div>
          )}
          <Button onClick={handleUpload} disabled={saving || storage === "missing"} style={{ backgroundColor: "#00bcd4", color: "white" }}>
            <Upload className="w-4 h-4 mr-2" />
            {saving ? "올리는 중..." : "업로드"}
          </Button>
        </CardContent>
      </Card>

      {/* 올린 자료 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-base">
            <FileText className="w-5 h-5 mr-2" style={{ color: "#00bcd4" }} />
            올린 자료 ({materials.length})
          </CardTitle>
          <Button size="sm" variant="outline" onClick={loadMaterials}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> 새로고침
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {listError && <p className="text-sm text-red-600">{listError}</p>}
          {TEACHER_FILE_TABS.map((t) => {
            const items = byTab.get(t) || [];
            return (
              <div key={t}>
                <p className="text-sm font-semibold text-gray-700 mb-1.5">{t} <span className="text-gray-400 font-normal">({items.length})</span></p>
                {items.length === 0 ? (
                  <p className="text-xs text-gray-400 pl-1">아직 올린 자료가 없습니다.</p>
                ) : (
                  <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                    {items.map((m) => (
                      <li key={m.id} className="flex items-center gap-3 px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{m.title}</p>
                          <p className="text-xs text-gray-400">
                            {scopeOf(m.category)} · {[m.uploadData?.fileName, m.wordFile?.fileName].filter(Boolean).map(fileKindLabel).join(" + ")} · {new Date(m.uploadDate).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(m)} aria-label={`${m.title} 삭제`}>
                          <Trash2 className="w-4 h-4 text-gray-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
