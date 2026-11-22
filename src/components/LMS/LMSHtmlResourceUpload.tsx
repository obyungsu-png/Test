import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowDown, ArrowUp, Check, Copy, ExternalLink, FileCode2, HardDriveUpload, Pencil, Play, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getSubjectStructure, saveMaterialsStrict } from "../utils/dataManager";
import {
  MAX_HTML_BYTES,
  START_ONLY_TAB,
  enterFullscreen,
  extractHtmlTitle,
  isHtmlFile,
  isInteractiveMaterial,
  loadHtmlBlob,
  readFileAsDataUrl,
} from "../utils/interactiveHtml";
import {
  HTML_BUCKET,
  HTML_STORAGE_SETUP_SQL,
  SUPABASE_SQL_EDITOR_URL,
  checkHtmlStorage,
  newHtmlMaterialId,
  removeHtmlFile,
  uploadHtmlFile,
  type HtmlStorageStatus,
} from "../../utils/htmlMaterialStorage";
import { InteractiveHtmlPlayer } from "../InteractiveHtmlPlayer";

type SchoolType = "korean" | "international" | "certification";

interface LMSHtmlResourceUploadProps {
  /** 콘텐츠 관리에서 불러온 업로드 자료 전체 */
  materials: any[];
  /** 업로드·수정·삭제 후 목록 새로고침 */
  onChanged: () => Promise<void>;
}

const SCHOOL_LABEL: Record<SchoolType, string> = { korean: "한국학교", international: "국제학교", certification: "인증시험" };

/** 예전 방식(파일 내용을 자료 목록 안에 통째로 저장)으로 올라간 자료인지 */
const isEmbeddedHtml = (m: any) => String(m?.uploadData?.fileData || "").startsWith("data:");

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * CMS > 콘텐츠 관리 > HTML 보조자료
 * .html 파일을 학년별 '보조자료' 탭에 올리면, 사이트에서 START 버튼으로 전체화면 실행된다.
 * 파일은 Supabase 파일 저장소에 하나씩 따로 저장하고, 자료 목록에는 주소만 남긴다.
 */
export default function LMSHtmlResourceUpload({ materials, onChanged }: LMSHtmlResourceUploadProps) {
  const [schoolType, setSchoolType] = useState<SchoolType>("korean");
  const [subject, setSubject] = useState("영어");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [playing, setPlaying] = useState<any>(null);
  const [storage, setStorage] = useState<HtmlStorageStatus | "checking">("checking");
  const [migrating, setMigrating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [listSaving, setListSaving] = useState(false);
  const listSavingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refreshStorageStatus = async () => {
    setStorage("checking");
    setStorage(await checkHtmlStorage());
  };
  useEffect(() => {
    refreshStorageStatus();
  }, []);

  const hierarchy: Record<string, Record<string, string[]>> = getSubjectStructure(schoolType) as any;
  const levels = hierarchy[subject] || {};
  const categories = levels[level] || [];
  const htmlMaterials = materials.filter(isInteractiveMaterial);
  const embeddedMaterials = htmlMaterials.filter(isEmbeddedHtml);
  const storageMissing = storage === "missing";

  const pickFile = async (f?: File | null) => {
    if (!f) return;
    if (!isHtmlFile({ fileName: f.name, fileType: f.type })) {
      toast.error(".html 파일만 올릴 수 있습니다.");
      return;
    }
    if (f.size > MAX_HTML_BYTES) {
      toast.error(`파일이 너무 큽니다 (${formatSize(f.size)}). ${formatSize(MAX_HTML_BYTES)} 이하로 올려 주세요.`);
      return;
    }
    try {
      const [dataUrl, text] = await Promise.all([readFileAsDataUrl(f), f.text()]);
      setFile(f);
      setFileDataUrl(dataUrl);
      setTitle((prev) => prev.trim() || extractHtmlTitle(text) || f.name.replace(/\.html?$/i, ""));
    } catch (err) {
      console.error(err);
      toast.error("파일을 읽지 못했습니다.");
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileDataUrl(null);
    setTitle("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const play = (material: any) => {
    enterFullscreen(); // 클릭 직후에 요청해야 허용됨
    setPlaying(material);
  };

  const handleUpload = async () => {
    if (!subject || !level || !category) {
      toast.error("과목 · 학습 단계 · 학년(세부 과목)을 모두 선택해 주세요.");
      return;
    }
    if (!file || !fileDataUrl) {
      toast.error("HTML 파일을 선택해 주세요.");
      return;
    }
    const finalTitle = title.trim() || file.name;
    const id = newHtmlMaterialId();
    const now = new Date().toISOString();
    setSaving(true);
    let uploadedPath: string | null = null;
    try {
      // ① 파일은 파일 저장소에 따로
      const { url, path } = await uploadHtmlFile(id, file);
      uploadedPath = path;
      // ② 자료 목록에는 정보와 주소만 (자료당 1KB 미만)
      await saveMaterialsStrict((list) => [
        ...list,
        {
          id,
          title: finalTitle,
          description: description.trim() || "HTML 보조자료 (사이트에서 START 로 실행)",
          subject,
          level,
          category,
          schoolType,
          contentType: START_ONLY_TAB,
          uploadDate: now,
          password: "",
          downloadCount: 0,
          fileSize: formatSize(file.size),
          isUploaded: true,
          source: "content-management",
          uploadData: {
            fileName: file.name,
            fileType: "text/html",
            fileData: url,
            fileSize: file.size,
            storageBucket: HTML_BUCKET,
            storagePath: path,
            uploadDate: now,
          },
        },
      ]);
      toast.success(`"${finalTitle}" 업로드 완료`, {
        description: `${subject} › ${category} › ${START_ONLY_TAB} 탭에서 START 로 실행됩니다.`,
      });
      clearFile();
      setDescription("");
      onChanged();
    } catch (err: any) {
      console.error(err);
      if (uploadedPath) removeHtmlFile(uploadedPath); // 목록 저장 실패 시 올린 파일 정리
      toast.error("업로드하지 못했습니다", { description: err?.message || String(err), duration: 10000 });
      if (/저장소가 아직 없습니다/.test(err?.message || "")) setStorage("missing");
    } finally {
      setSaving(false);
    }
  };

  // 예전 방식으로 목록 안에 들어 있는 HTML 을 파일 저장소로 옮겨 목록을 가볍게
  const handleMigrate = async () => {
    if (!embeddedMaterials.length) return;
    setMigrating(true);
    const moved: Record<string, { url: string; path: string }> = {};
    try {
      for (const m of embeddedMaterials) {
        const blob = await loadHtmlBlob(m.uploadData.fileData);
        moved[m.id] = await uploadHtmlFile(newHtmlMaterialId(), blob);
      }
      await saveMaterialsStrict((list) =>
        list.map((m: any) =>
          moved[m.id]
            ? {
                ...m,
                uploadData: {
                  ...m.uploadData,
                  fileType: "text/html",
                  fileData: moved[m.id].url,
                  storageBucket: HTML_BUCKET,
                  storagePath: moved[m.id].path,
                },
              }
            : m
        )
      );
      toast.success(`${Object.keys(moved).length}개 자료를 파일 저장소로 옮겼습니다.`);
      onChanged();
    } catch (err: any) {
      console.error(err);
      Object.values(moved).forEach((f) => removeHtmlFile(f.path));
      toast.error("옮기지 못했습니다", { description: err?.message || String(err), duration: 10000 });
    } finally {
      setMigrating(false);
    }
  };

  const handleRename = async (material: any) => {
    if (listSavingRef.current) return;
    const nextTitle = editedTitle.trim();
    if (!nextTitle) {
      toast.error("제목을 입력해 주세요.");
      return;
    }
    if (nextTitle === material.title) {
      setEditingId(null);
      return;
    }
    listSavingRef.current = true;
    setListSaving(true);
    try {
      await saveMaterialsStrict((list) => {
        if (!list.some((m) => m.id === material.id && isInteractiveMaterial(m))) {
          throw new Error("자료를 찾을 수 없습니다. 목록을 새로고침해 주세요.");
        }
        return list.map((m) => m.id === material.id ? { ...m, title: nextTitle } : m);
      });
      setEditingId(null);
      await onChanged();
      toast.success("자료 이름을 변경했습니다.");
    } catch (err: any) {
      toast.error("이름을 변경하지 못했습니다", { description: err?.message || String(err) });
    } finally {
      listSavingRef.current = false;
      setListSaving(false);
    }
  };

  const handleMove = async (material: any, direction: -1 | 1) => {
    if (listSavingRef.current) return;
    listSavingRef.current = true;
    setListSaving(true);
    try {
      await saveMaterialsStrict((list) => {
        const positions = list.flatMap((m, index) => isInteractiveMaterial(m) ? [index] : []);
        const from = positions.findIndex((index) => list[index].id === material.id);
        const currentOrder = positions.map((index) => list[index].id);
        if (from < 0 || currentOrder.length !== htmlMaterials.length || currentOrder.some((id, index) => id !== htmlMaterials[index].id)) {
          throw new Error("자료 순서가 바뀌었습니다. 목록을 새로고침해 주세요.");
        }
        const to = from + direction;
        if (to < 0 || to >= positions.length) {
          throw new Error("자료 순서가 바뀌었습니다. 목록을 새로고침해 주세요.");
        }
        const next = [...list];
        [next[positions[from]], next[positions[to]]] = [next[positions[to]], next[positions[from]]];
        return next;
      });
      await onChanged();
      toast.success("자료 순서를 변경했습니다.");
    } catch (err: any) {
      toast.error("순서를 변경하지 못했습니다", { description: err?.message || String(err) });
    } finally {
      listSavingRef.current = false;
      setListSaving(false);
    }
  };

  const handleDelete = async (material: any) => {
    if (listSavingRef.current) return;
    if (!confirm(`"${material.title}" 을(를) 삭제할까요?`)) return;
    listSavingRef.current = true;
    setListSaving(true);
    try {
      await saveMaterialsStrict((list) => list.filter((m: any) => m.id !== material.id));
      await removeHtmlFile(material.uploadData?.storagePath);
      toast.success("삭제했습니다.");
      await onChanged();
    } catch (err: any) {
      toast.error("삭제하지 못했습니다", { description: err?.message || String(err) });
    } finally {
      listSavingRef.current = false;
      setListSaving(false);
    }
  };

  const copySetupSql = async () => {
    try {
      await navigator.clipboard.writeText(HTML_STORAGE_SETUP_SQL);
      toast.success("SQL 을 복사했습니다. Supabase SQL Editor 에 붙여 넣고 Run 을 누르세요.");
    } catch {
      toast.error("복사하지 못했습니다. 아래 SQL 을 직접 선택해 복사해 주세요.");
    }
  };

  return (
    <div className="space-y-4">
      {/* 파일 저장소 최초 설정 안내 */}
      {storageMissing && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 space-y-1">
                <p className="font-semibold">파일 저장소 설정이 한 번 필요합니다</p>
                <p>
                  HTML 파일은 자료 목록과 따로 Supabase 파일 저장소에 저장합니다. 아래 SQL 을 복사해
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
              <Button size="sm" variant="outline" onClick={refreshStorageStatus}>
                <RefreshCw className="w-4 h-4 mr-1.5" /> 다시 확인
              </Button>
            </div>
            <pre className="text-[11px] leading-relaxed bg-white border border-amber-200 rounded p-3 overflow-x-auto whitespace-pre select-all">
{HTML_STORAGE_SETUP_SQL}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* 예전 방식 자료 → 파일 저장소로 옮기기 */}
      {!storageMissing && embeddedMaterials.length > 0 && (
        <Card className="border-cyan-200 bg-cyan-50">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="flex-1 text-sm text-cyan-900">
              자료 목록 안에 통째로 저장된 HTML 이 <b>{embeddedMaterials.length}개</b> 있습니다. 파일 저장소로 옮기면
              사이트가 가벼워집니다. (사이트에서 보이는 모습은 그대로)
            </p>
            <Button onClick={handleMigrate} disabled={migrating} style={{ backgroundColor: "#00bcd4", color: "white" }}>
              <HardDriveUpload className="w-4 h-4 mr-2" />
              {migrating ? "옮기는 중…" : "파일 저장소로 옮기기"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <FileCode2 className="w-5 h-5 mr-2" style={{ color: "#00bcd4" }} />
            HTML 보조자료 업로드
          </CardTitle>
          <p className="text-sm text-gray-500">
            .html 학습 자료를 학년별 <b>보조자료</b> 탭에 올립니다. 사이트에서는 다운로드·시험보기 대신{" "}
            <b>START</b> 버튼 하나로 전체화면 실행됩니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 분류 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">학교 타입</label>
              <Select
                value={schoolType}
                onValueChange={(v) => {
                  setSchoolType(v as SchoolType);
                  setSubject(v === "korean" ? "영어" : "");
                  setLevel("");
                  setCategory("");
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="korean">한국학교</SelectItem>
                  <SelectItem value="international">국제학교</SelectItem>
                  <SelectItem value="certification">인증시험</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">과목</label>
              <Select value={subject} onValueChange={(v) => { setSubject(v); setLevel(""); setCategory(""); }}>
                <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(hierarchy).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">학습 단계</label>
              <Select value={level} onValueChange={(v) => { setLevel(v); setCategory(""); }}>
                <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(levels).map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">학년 (세부 과목)</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">콘텐츠 타입</label>
              <Input value={START_ONLY_TAB} disabled className="bg-gray-50" />
            </div>
          </div>

          {/* 파일 */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files?.[0]); }}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver ? "border-cyan-400 bg-cyan-50" : "border-gray-300"}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".html,.htm,text/html"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <FileCode2 className="w-8 h-8 text-cyan-600" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 break-all">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={clearFile} title="파일 빼기">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-3">HTML 파일을 여기로 끌어 놓거나 선택하세요</p>
                <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                  파일 선택
                </Button>
              </>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">제목 (사이트 목록에 표시)</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="파일을 고르면 HTML 제목으로 자동 입력" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">설명 (선택)</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="예: Part 5 홀수 · Part 6 전체" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="sm:flex-1"
              disabled={!fileDataUrl}
              onClick={() =>
                fileDataUrl &&
                play({ title: title || file?.name, uploadData: { fileName: file?.name, fileType: "text/html", fileData: fileDataUrl } })
              }
            >
              <Play className="w-4 h-4 mr-2" />
              미리 실행 (업로드 전 확인)
            </Button>
            <Button
              className="sm:flex-1"
              disabled={saving || storageMissing || storage === "checking"}
              onClick={handleUpload}
              style={{ backgroundColor: "#00bcd4", color: "white" }}
            >
              <Upload className="w-4 h-4 mr-2" />
              {saving ? "업로드 중…" : storageMissing ? "파일 저장소 설정 후 업로드 가능" : "보조자료로 업로드"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 등록된 HTML 보조자료 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">등록된 HTML 보조자료 ({htmlMaterials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {htmlMaterials.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">아직 올린 HTML 보조자료가 없습니다.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {htmlMaterials.map((m, index) => (
                <div key={m.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    {editingId === m.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(m);
                            if (e.key === "Escape" && !listSaving) setEditingId(null);
                          }}
                          aria-label="HTML 보조자료 제목"
                          className="max-w-md"
                          autoFocus
                          disabled={listSaving}
                        />
                        <Button variant="outline" size="sm" onClick={() => handleRename(m)} disabled={listSaving} title="이름 저장" aria-label="이름 저장">
                          <Check className="w-4 h-4 text-cyan-600" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)} disabled={listSaving} title="취소" aria-label="이름 변경 취소">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-900 truncate" title={m.title}>{m.title}</p>
                    )}
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      <Badge variant="outline" style={{ borderColor: "#00bcd4", color: "#00bcd4" }} className="text-[10px]">
                        {SCHOOL_LABEL[m.schoolType as SchoolType] || m.schoolType}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{m.subject}</Badge>
                      <Badge variant="outline" className="text-[10px]">{m.category}</Badge>
                      <Badge variant="outline" className="text-[10px]">{m.contentType}</Badge>
                      <span className="text-[11px] text-gray-400">{m.fileSize}</span>
                      {isEmbeddedHtml(m) && <span className="text-[11px] text-amber-600">· 예전 방식 저장</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handleMove(m, -1)} disabled={listSaving || index === 0} title="위로 이동" aria-label={`${m.title} 위로 이동`}>
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleMove(m, 1)} disabled={listSaving || index === htmlMaterials.length - 1} title="아래로 이동" aria-label={`${m.title} 아래로 이동`}>
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    {editingId !== m.id && (
                      <Button variant="outline" size="sm" disabled={listSaving} onClick={() => { setEditingId(m.id); setEditedTitle(m.title || ""); }} title="이름 변경" aria-label={`${m.title} 이름 변경`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => play(m)} title="실행" aria-label={`${m.title} 실행`}>
                      <Play className="w-4 h-4 text-cyan-600" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={listSaving} onClick={() => handleDelete(m)} title="삭제" aria-label={`${m.title} 삭제`}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {playing && <InteractiveHtmlPlayer material={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
