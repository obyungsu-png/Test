import { useState, useRef } from "react";
import { Plus, Trash2, Save, FileText, Upload as UploadIcon, Eye, EyeOff, ChevronDown, ChevronUp, Download, ClipboardPaste, X, Check } from "lucide-react";
import { toast } from "sonner";
import { getSubjectStructure } from "../utils/dataManager";
import { KOREAN_SCHOOL_TABS, INTERNATIONAL_SCHOOL_TABS, CERTIFICATION_TABS } from "../constants/defaultContent";

interface QuestionData {
  id: string;
  question: string;
  passage: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
}

interface TestMeta {
  schoolName: string;
  subject: string;
  grade: string;
  semester: string;
  testName: string;
  date: string;
  time: string;
  totalScore: string;
}

interface TestFormBuilderProps {
  onSave?: (txtContent: string, testTitle: string, metadata?: any, pdfFile?: File) => void;
}

const EMPTY_QUESTION = (): QuestionData => ({
  id: Date.now().toString(),
  question: "",
  passage: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
});

// ─── 시험지 양식 → 인쇄용 HTML 생성 ─────────────────────────────
function buildExamHTML(meta: TestMeta, questions: QuestionData[]): string {
  const qHtml = questions.map((q, i) => {
    const opts = q.options.map((o, j) => `
      <div class="option">
        <span class="opt-label">${String.fromCharCode(65+j)}</span>
        <span>${o}</span>
      </div>`).join('');
    const passage = q.passage ? `<div class="passage">${q.passage.replace(/\n/g,'<br/>')}</div>` : '';
    return `
    <div class="question-block">
      <div class="q-num-row"><span class="q-num">${i+1}.</span><span class="q-text">${q.question}</span></div>
      ${passage}
      <div class="options">${opts}</div>
    </div>`;
  }).join('');

  const answerKey = questions.map((q,i)=>
    `<span class="ans-item">${i+1}.&nbsp;<b>${String.fromCharCode(65+q.correctAnswer)}</b></span>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<title>${meta.testName}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: '맑은 고딕', 'Malgun Gothic', Arial, sans-serif; font-size: 11pt; color: #111; margin: 0; }
  .header { border-bottom: 2.5px solid #111; padding-bottom: 8px; margin-bottom: 16px; }
  .header-top { display: flex; justify-content: space-between; align-items: flex-end; }
  .school-name { font-size: 13pt; font-weight: 700; }
  .test-name { font-size: 17pt; font-weight: 800; letter-spacing: -0.5px; text-align: center; margin: 6px 0 4px; }
  .meta-row { display: flex; gap: 20px; font-size: 9.5pt; color: #444; justify-content: flex-end; }
  .meta-item { display: flex; gap: 4px; }
  .score-box { border: 1.5px solid #111; padding: 2px 12px; font-weight: 700; font-size: 10pt; }
  .name-box { display: flex; gap: 16px; font-size: 10pt; margin-top: 4px; }
  .name-field { border-bottom: 1px solid #999; width: 100px; display: inline-block; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
  .question-block { margin-bottom: 14px; break-inside: avoid; }
  .q-num-row { display: flex; gap: 6px; margin-bottom: 5px; }
  .q-num { font-weight: 700; min-width: 18px; }
  .q-text { line-height: 1.5; }
  .passage { background: #f7f7f7; border-left: 3px solid #ccc; padding: 7px 10px; margin: 6px 0 8px; font-size: 10pt; line-height: 1.6; white-space: pre-wrap; }
  .options { padding-left: 6px; }
  .option { display: flex; gap: 7px; margin-bottom: 3px; font-size: 10.5pt; }
  .opt-label { font-weight: 600; min-width: 16px; color: #333; }
  .answer-key { margin-top: 20px; border-top: 1.5px dashed #aaa; padding-top: 10px; font-size: 9.5pt; }
  .answer-key-title { font-weight: 700; margin-bottom: 6px; }
  .ans-items { display: flex; flex-wrap: wrap; gap: 6px 16px; }
  .ans-item { min-width: 36px; }
  @media print { body { -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <div class="header-top">
    <span class="school-name">${meta.schoolName || '학교명'}</span>
    <div class="meta-row">
      <span class="meta-item">${meta.grade}학년 ${meta.semester}학기</span>
      <span class="meta-item">시험일: ${meta.date}</span>
      <span class="meta-item">시간: ${meta.time}분</span>
      <span class="score-box">총 ${meta.totalScore}점</span>
    </div>
  </div>
  <div class="test-name">${meta.testName || '시험지'}</div>
  <div class="name-box">
    <span>반: <span class="name-field">&nbsp;</span></span>
    <span>번호: <span class="name-field">&nbsp;</span></span>
    <span>이름: <span class="name-field">&nbsp;</span></span>
  </div>
</div>
<div class="columns">
${qHtml}
</div>
<div class="answer-key">
  <div class="answer-key-title">■ 정답표</div>
  <div class="ans-items">${answerKey}</div>
</div>
<script>window.onload = () => window.print();<\/script>
</body>
</html>`;
}

// ─── 시험지 → 표준 txt (퀴즈 파서 포맷) ─────────────────────────
function buildTxt(meta: TestMeta, questions: QuestionData[]): string {
  return questions.map((q, i) => {
    const opts = q.options.map((o, j) => `${String.fromCharCode(65+j)}. ${o}`).join('\n');
    const passage = q.passage ? `[Passage]\n${q.passage}\n[/Passage]\n\n` : '';
    return `${i+1}. ${q.question}\n\n${passage}${opts}\n\n정답: ${String.fromCharCode(65+q.correctAnswer)}\n\n[해설]\n${q.explanation || '없음'}\n[/해설]`;
  }).join('\n\n---\n\n');
}

// ─── 대량 붙여넣기 파서 ──────────────────────────────────────────
function parseBulkText(raw: string): QuestionData[] {
  const blocks = raw.split(/\n---+\n|\n\n(?=\d+\.)/).filter(b => b.trim());
  const result: QuestionData[] = [];
  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    // Question line: "1. ..." or just text
    let qLine = lines[0].replace(/^\d+\.\s*/, '');
    const options: string[] = [];
    let correctAnswer = 0;
    let explanation = '';
    let passage = '';
    let inPassage = false;
    let passageLines: string[] = [];

    for (let li = 1; li < lines.length; li++) {
      const l = lines[li];
      if (l === '[Passage]') { inPassage = true; continue; }
      if (l === '[/Passage]') { inPassage = false; passage = passageLines.join('\n'); continue; }
      if (inPassage) { passageLines.push(l); continue; }
      const optMatch = l.match(/^([A-E가나다라마①②③④⑤])[.)]\s*(.+)/);
      if (optMatch) { options.push(optMatch[2].trim()); continue; }
      const ansMatch = l.match(/^(?:정답|답|Answer)[:\s]+([A-E가나다라마①②③④⑤])/i);
      if (ansMatch) {
        const letter = ansMatch[1].toUpperCase();
        correctAnswer = letter.charCodeAt(0) - 65;
        if (correctAnswer < 0) correctAnswer = 0;
        continue;
      }
      const expMatch = l.match(/^\[해설\](.*)$/);
      if (expMatch) { explanation = expMatch[1].trim(); continue; }
    }
    if (!qLine || options.length < 2) continue;
    // pad to 4 options
    while (options.length < 4) options.push('');
    result.push({ id: Date.now().toString() + result.length, question: qLine, passage, options: options.slice(0,4), correctAnswer, explanation });
  }
  return result;
}

export default function TestFormBuilder({ onSave }: TestFormBuilderProps) {
  const [tab, setTab] = useState<'editor'|'bulk'|'preview'>('editor');
  const [questions, setQuestions] = useState<QuestionData[]>([EMPTY_QUESTION()]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set([questions[0].id]));
  const [bulkText, setBulkText] = useState('');
  const [meta, setMeta] = useState<TestMeta>({
    schoolName: '', subject: '영어', grade: '1', semester: '1',
    testName: '기말고사', date: new Date().toLocaleDateString('ko-KR'),
    time: '45', totalScore: '100',
  });
  const [schoolType, setSchoolType] = useState<'korean'|'international'|'certification'>('korean');
  const [uploadMeta, setUploadMeta] = useState({ subject:'', level:'', category:'', contentType:'', title:'', description:'', password:'' });
  const subjectHierarchy = getSubjectStructure(schoolType);
  const contentTypes = schoolType === 'korean' ? KOREAN_SCHOOL_TABS : schoolType === 'international' ? INTERNATIONAL_SCHOOL_TABS : CERTIFICATION_TABS;

  // ── Question CRUD ──────────────────────────────────────────────
  const addQuestion = () => {
    const q = EMPTY_QUESTION();
    setQuestions(prev => [...prev, q]);
    setExpanded(prev => new Set([...prev, q.id]));
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) { toast.error('최소 1개의 문제가 필요합니다.'); return; }
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, patch: Partial<QuestionData>) =>
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));

  const updateOption = (qid: string, idx: number, val: string) =>
    setQuestions(prev => prev.map(q => q.id === qid ? { ...q, options: q.options.map((o,i) => i===idx ? val : o) } : q));

  const toggleExpand = (id: string) =>
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  // ── 대량 붙여넣기 파싱 ─────────────────────────────────────────
  const handleBulkParse = () => {
    const parsed = parseBulkText(bulkText);
    if (!parsed.length) { toast.error('파싱된 문제가 없습니다. 형식을 확인해주세요.'); return; }
    setQuestions(prev => [...prev.filter(q => q.question.trim()), ...parsed]);
    setExpanded(new Set(parsed.map(q => q.id)));
    toast.success(`${parsed.length}개 문제를 추가했습니다!`);
    setTab('editor');
  };

  // ── PDF/Word 다운로드 ──────────────────────────────────────────
  const downloadPDF = () => {
    const html = buildExamHTML(meta, questions.filter(q => q.question.trim()));
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${meta.testName || '시험지'}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('PDF 저장: 열린 창에서 Ctrl+P → PDF로 저장하세요.');
  };

  const downloadWord = () => {
    const qs = questions.filter(q => q.question.trim());
    const body = qs.map((q,i) => {
      const opts = q.options.map((o,j) => `<p style="margin:2px 0 2px 16px">${String.fromCharCode(65+j)}. ${o}</p>`).join('');
      const passage = q.passage ? `<p style="background:#f5f5f5;padding:8px;margin:6px 0;font-size:10pt">${q.passage.replace(/\n/g,'<br/>')}</p>` : '';
      return `<p><b>${i+1}. ${q.question}</b></p>${passage}${opts}<p style="color:#888;font-size:9pt">▶ 정답: ${String.fromCharCode(65+q.correctAnswer)} | ${q.explanation}</p><hr/>`;
    }).join('');
    const html = `<html><head><meta charset="utf-8"/><style>body{font-family:'맑은 고딕',Arial;font-size:11pt;margin:30px}h1{font-size:16pt;text-align:center}p{margin:4px 0}</style></head><body><h1>${meta.testName}</h1><p style="text-align:right;font-size:9pt">${meta.schoolName} | ${meta.grade}학년 ${meta.semester}학기 | ${meta.date}</p>${body}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${meta.testName || '시험지'}.doc`;
    a.click();
    toast.success('Word 파일 다운로드 완료!');
  };

  // ── CMS 저장 (시험보기 연동) ───────────────────────────────────
  const handleSave = () => {
    const valid = questions.filter(q => q.question.trim() && q.options.filter(o=>o.trim()).length >= 2);
    if (!valid.length) { toast.error('최소 1개의 완성된 문제가 필요합니다.'); return; }
    const title = uploadMeta.title || meta.testName || '시험지';
    const txt = buildTxt(meta, valid);
    if (onSave) {
      onSave(txt, title, {
        schoolType, subject: uploadMeta.subject, level: uploadMeta.level,
        category: uploadMeta.category, contentType: uploadMeta.contentType,
        title, description: uploadMeta.description, password: uploadMeta.password,
      });
    }
  };

  // ── UI ────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* 탭 헤더 */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-0">
        {([['editor','✏️ 문제 편집'],['bulk','📋 대량 입력'],['preview','👁️ 미리보기']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${tab===key ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={downloadWord} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
            <Download className="w-3.5 h-3.5"/> Word
          </button>
          <button onClick={downloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
            <Download className="w-3.5 h-3.5"/> PDF
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600">
            <Save className="w-3.5 h-3.5"/> 저장·연동
          </button>
        </div>
      </div>

      {/* ── 탭1: 문제 편집 ── */}
      {tab === 'editor' && (
        <div className="space-y-3">
          {/* 시험지 메타 */}
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[['schoolName','학교명'],['testName','시험지 제목'],['grade','학년'],['semester','학기'],['subject','과목'],['date','시험일'],['time','시험시간(분)'],['totalScore','총점']].map(([k,label]) => (
              <div key={k}>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</label>
                <input value={(meta as any)[k]} onChange={e => setMeta(prev => ({...prev, [k]: e.target.value}))}
                  className="w-full mt-0.5 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-400 bg-white"/>
              </div>
            ))}
          </div>

          {/* 문제 목록 */}
          {questions.map((q, i) => (
            <div key={q.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              {/* 문제 헤더 */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                <span className="flex-1 text-sm text-gray-600 truncate">{q.question || '문제 내용 없음'}</span>
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">정답 {String.fromCharCode(65+q.correctAnswer)}</span>
                <button onClick={() => toggleExpand(q.id)} className="text-gray-400 hover:text-gray-600 p-1">
                  {expanded.has(q.id) ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                </button>
                <button onClick={() => removeQuestion(q.id)} className="text-gray-300 hover:text-red-400 p-1"><Trash2 className="w-4 h-4"/></button>
              </div>

              {/* 문제 본문 */}
              {expanded.has(q.id) && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">문제</label>
                    <textarea value={q.question} onChange={e => updateQuestion(q.id,'question',e.target.value)} rows={2}
                      placeholder="문제를 입력하세요"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-400 resize-none"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">지문 (선택)</label>
                    <textarea value={q.passage} onChange={e => updateQuestion(q.id,'passage',e.target.value)} rows={3}
                      placeholder="지문이 있으면 입력하세요"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-400 resize-none bg-gray-50"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">선택지 (정답 클릭으로 선택)</label>
                    <div className="space-y-1.5">
                      {q.options.map((opt, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <button onClick={() => updateQuestion(q.id,'correctAnswer',j)}
                            className={`w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 transition-colors ${q.correctAnswer===j ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {String.fromCharCode(65+j)}
                          </button>
                          <input value={opt} onChange={e => updateOption(q.id, j, e.target.value)}
                            placeholder={`선택지 ${String.fromCharCode(65+j)}`}
                            className={`flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none transition-colors ${q.correctAnswer===j ? 'border-green-300 bg-green-50 focus:border-green-400' : 'border-gray-200 focus:border-cyan-400'}`}/>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">해설</label>
                    <input value={q.explanation} onChange={e => updateQuestion(q.id,'explanation',e.target.value)}
                      placeholder="해설을 입력하세요 (선택)"
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-400"/>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button onClick={addQuestion}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-cyan-400 hover:text-cyan-500 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4"/> 문제 추가
          </button>

          {/* CMS 메타 */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-3 mt-4">
            <p className="text-xs font-bold text-blue-700">📌 시험보기 연동 설정 (저장·연동 버튼 클릭 시 자료실에 등록됩니다)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">학교 유형</label>
                <select value={schoolType} onChange={e => setSchoolType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-400 bg-white">
                  <option value="korean">국내 학교</option>
                  <option value="international">국제 학교</option>
                  <option value="certification">자격증</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">과목</label>
                <select value={uploadMeta.subject} onChange={e => setUploadMeta(p=>({...p,subject:e.target.value}))}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-400 bg-white">
                  <option value="">선택</option>
                  {Object.keys(subjectHierarchy).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">레벨</label>
                <select value={uploadMeta.level} onChange={e => setUploadMeta(p=>({...p,level:e.target.value}))}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-400 bg-white">
                  <option value="">선택</option>
                  {(uploadMeta.subject && subjectHierarchy[uploadMeta.subject] ? Object.keys(subjectHierarchy[uploadMeta.subject]) : []).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">탭</label>
                <select value={uploadMeta.contentType} onChange={e => setUploadMeta(p=>({...p,contentType:e.target.value}))}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-400 bg-white">
                  <option value="">선택</option>
                  {contentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 mb-1 block">자료 제목</label>
                <input value={uploadMeta.title} onChange={e => setUploadMeta(p=>({...p,title:e.target.value}))}
                  placeholder={meta.testName || '시험지 제목'}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-400"/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 탭2: 대량 입력 ── */}
      {tab === 'bulk' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
            <p className="font-bold">📋 대량 입력 형식</p>
            <pre className="text-xs bg-white rounded-lg p-3 mt-2 text-gray-700 overflow-x-auto whitespace-pre-wrap">{`1. 문제 내용을 입력하세요

A. 선택지 A
B. 선택지 B
C. 선택지 C
D. 선택지 D

정답: B

[해설]정답 해설을 입력하세요[/해설]

---

2. 두 번째 문제

A. 선택지 A
B. 선택지 B
C. 선택지 C
D. 선택지 D

정답: A`}</pre>
          </div>
          <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={20}
            placeholder="위 형식대로 문제를 붙여넣으세요. --- 로 문제를 구분합니다."
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 font-mono resize-none"/>
          <div className="flex gap-3">
            <button onClick={() => setBulkText('')} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">초기화</button>
            <button onClick={handleBulkParse} className="flex-1 py-2 text-sm font-bold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 flex items-center justify-center gap-2">
              <ClipboardPaste className="w-4 h-4"/> {bulkText.split(/\n---+\n/).filter(b=>b.trim()).length}개 문제 파싱 → 편집기로 추가
            </button>
          </div>
        </div>
      )}

      {/* ── 탭3: 미리보기 ── */}
      {tab === 'preview' && (
        <div className="space-y-4">
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            {/* 시험지 헤더 미리보기 */}
            <div className="bg-white p-6 border-b-2 border-gray-800">
              <div className="flex justify-between items-end mb-1">
                <span className="font-bold text-base">{meta.schoolName || '학교명'}</span>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>{meta.grade}학년 {meta.semester}학기</span>
                  <span>시험일: {meta.date}</span>
                  <span>시간: {meta.time}분</span>
                  <span className="border border-gray-800 px-2 font-bold">총 {meta.totalScore}점</span>
                </div>
              </div>
              <div className="text-center text-xl font-extrabold my-2">{meta.testName || '시험지'}</div>
              <div className="flex gap-6 text-sm">
                <span>반: <span className="inline-block w-16 border-b border-gray-400">&nbsp;</span></span>
                <span>번호: <span className="inline-block w-16 border-b border-gray-400">&nbsp;</span></span>
                <span>이름: <span className="inline-block w-24 border-b border-gray-400">&nbsp;</span></span>
              </div>
            </div>
            {/* 문제 목록 미리보기 */}
            <div className="bg-white p-6 grid grid-cols-2 gap-x-8 gap-y-5">
              {questions.filter(q=>q.question.trim()).map((q,i) => (
                <div key={q.id} className="break-inside-avoid">
                  <p className="font-semibold text-sm mb-1.5">{i+1}. {q.question}</p>
                  {q.passage && <p className="text-xs bg-gray-50 border-l-2 border-gray-300 px-2 py-1.5 mb-2 leading-relaxed">{q.passage}</p>}
                  <div className="space-y-0.5">
                    {q.options.filter(o=>o.trim()).map((o,j)=>(
                      <p key={j} className={`text-xs flex gap-1.5 ${q.correctAnswer===j?'text-green-700 font-semibold':''}`}>
                        <span className="font-bold">{String.fromCharCode(65+j)}.</span>{o}
                        {q.correctAnswer===j && <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-px"/>}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={downloadWord} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-blue-50">
              <Download className="w-4 h-4"/> Word 다운로드
            </button>
            <button onClick={downloadPDF} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50">
              <Download className="w-4 h-4"/> PDF 다운로드
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
