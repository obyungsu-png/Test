import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Copy, ExternalLink, FileText, Presentation, RefreshCw, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { saveMaterialsStrict } from "../utils/dataManager";
import * as lmsApi from "../../utils/lmsApi";
import { TEACHER_FILE_TABS, TEACHER_STRUCTURE, TEACHER_SUBJECT, TEACHER_TAB_INFO } from "../constants/teacherTabs";
import { SUPABASE_SQL_EDITOR_URL } from "../../utils/htmlMaterialStorage";
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
  type TeacherStorageStatus,
} from "../../utils/teacherFileStorage";

const isTeacherMaterial = (m: any) => m?.subject === TEACHER_SUBJECT && m?.schoolType === "korean";

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const fileKindLabel = (name = "") => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (ext === "ppt" || ext === "pptx") return "PowerPoint";
  if (ext === "hwp" || ext === "hwpx") return "한글";
  return "Word";
};

/**
 * CMS > 교사·강사 자료
 * 한국학교 > 교사·강사 과목의 탭(수업 자료·정답·해설·평가·문제은행·숙제·과제)에 파일을 올린다.
 * PDF 는 사이트의 시험보기·PDF 다운로드에, 원본(Word·PowerPoint·한글)은 편집용 다운로드에 쓰인다.
 * 파일은 Supabase 파일 저장소에 따로 저장하고, 자료 목록에는 주소만 남긴다.
 */
export default function LMSTeacherMaterials() {
  const [tab, setTab] = useState(TEACHER_FILE_TABS[0]);
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [storage, setStorage] = useState<TeacherStorageStatus | "checking">("checking");

  const refreshStorage = async () => {
    setStorage("checking");
    setStorage(await checkTeacherStorage());
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

  const pickFile = (file: File | null, kind: "pdf" | "original") => {
    if (!file) return kind === "pdf" ? setPdfFile(null) : setOriginalFile(null);
    if (kind === "pdf" ? !isPdfName(file.name) : !isOriginalName(file.name)) {
      toast.error(kind === "pdf" ? "PDF 파일만 올릴 수 있습니다." : "Word·PowerPoint·한글 파일만 올릴 수 있습니다.");
      setInputKey((k) => k + 1);
      return;
    }
    if (file.size > MAX_TEACHER_FILE_BYTES) {
      toast.error(`파일이 너무 큽니다 (최대 ${formatSize(MAX_TEACHER_FILE_BYTES)}).`);
      setInputKey((k) => k + 1);
      return;
    }
    if (kind === "pdf") setPdfFile(file);
    else setOriginalFile(file);
    if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleUpload = async () => {
    if (!area || !category) return toast.error("과목과 학년을 선택해 주세요.");
    if (!pdfFile && !originalFile) return toast.error("PDF 또는 원본 파일을 하나 이상 선택해 주세요.");
    const finalTitle = title.trim() || (pdfFile || originalFile)!.name;
    const id = newTeacherMaterialId();
    const now = new Date().toISOString();
    const uploadedPaths: string[] = [];
    setSaving(true);
    try {
      // ① 파일은 파일 저장소에 따로
      const fileInfo = async (file: File, suffix: string) => {
        const { url, path } = await uploadTeacherFile(`${id}-${suffix}`, file);
        uploadedPaths.push(path);
        return { fileName: file.name, fileType: mimeOf(file.name), fileData: url, fileSize: file.size, storageBucket: TEACHER_BUCKET, storagePath: path, uploadDate: now };
      };
      const pdf = pdfFile ? await fileInfo(pdfFile, "pdf") : null;
      const original = originalFile ? await fileInfo(originalFile, "original") : null;
      // ② 자료 목록에는 정보와 주소만. PDF 가 있으면 PDF 가 본 파일(시험보기), 원본은 편집용 다운로드
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
        fileSize: formatSize((pdfFile?.size || 0) + (originalFile?.size || 0)),
        isUploaded: true,
        source: "content-management",
        uploadData: pdf || original,
        ...(pdf && original ? { wordFile: original } : {}),
      };
      const next = await saveMaterialsStrict((list) => [...list, record as any]);
      setMaterials(next.filter(isTeacherMaterial));
      toast.success(`"${finalTitle}" 업로드 완료`, { description: `교사·강사 › ${tab} › ${category}` });
      setTitle("");
      setPdfFile(null);
      setOriginalFile(null);
      setInputKey((k) => k + 1);
    } catch (err: any) {
      console.error(err);
      removeTeacherFiles(uploadedPaths); // 목록 저장 실패 시 올린 파일 정리
      toast.error("업로드하지 못했습니다", { description: err?.message || String(err), duration: 10000 });
      if (/저장소가 아직 없습니다/.test(err?.message || "")) setStorage("missing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m: any) => {
    if (!window.confirm(`"${m.title}" 자료를 삭제할까요? 사이트에서도 사라집니다.`)) return;
    try {
      const next = await saveMaterialsStrict((list) => list.filter((x: any) => x.id !== m.id));
      setMaterials(next.filter(isTeacherMaterial));
      await removeTeacherFiles([m.uploadData?.storagePath, m.wordFile?.storagePath]);
      toast.success("삭제했습니다.");
    } catch (err: any) {
      toast.error("삭제하지 못했습니다", { description: err?.message || String(err) });
    }
  };

  const copySetupSql = async () => {
    try {
      await navigator.clipboard.writeText(TEACHER_STORAGE_SETUP_SQL);
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

      {/* 파일 저장소 최초 설정 안내 */}
      {storage === "missing" && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 space-y-1">
                <p className="font-semibold">파일 저장소 설정이 한 번 필요합니다</p>
                <p>
                  교사·강사 자료 파일은 자료 목록과 따로 Supabase 파일 저장소에 저장합니다. 아래 SQL 을 복사해
                  Supabase <b>SQL Editor</b> 에 붙여 넣고 <b>Run</b> 을 누른 뒤, <b>다시 확인</b>을 눌러 주세요.
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
{TEACHER_STORAGE_SETUP_SQL}
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
              <Select value={area} onValueChange={(v) => { setArea(v); setCategory(TEACHER_STRUCTURE[v]?.length === 1 ? TEACHER_STRUCTURE[v][0] : ""); }}>
                <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(TEACHER_STRUCTURE).map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">학년</label>
              <Select value={category} onValueChange={setCategory} disabled={!area}>
                <SelectTrigger><SelectValue placeholder={area ? "선택" : "과목을 먼저 선택"} /></SelectTrigger>
                <SelectContent>
                  {(TEACHER_STRUCTURE[area] || []).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {TEACHER_TAB_INFO[tab] && (
            <p className="text-xs text-gray-500">
              {TEACHER_TAB_INFO[tab].description} — 예: {TEACHER_TAB_INFO[tab].examples.join(", ")}
            </p>
          )}
          <div>
            <label className="block text-sm text-gray-600 mb-1">제목</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="비워 두면 파일 이름으로 저장" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" key={inputKey}>
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
                            {m.category} · {[m.uploadData?.fileName, m.wordFile?.fileName].filter(Boolean).map(fileKindLabel).join(" + ")} · {new Date(m.uploadDate).toLocaleDateString("ko-KR")}
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
