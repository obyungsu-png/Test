import { Clock } from "lucide-react";
import { TEACHER_TAB_INFO, parseTeacherCategory, teacherScopeLabel } from "./constants/teacherTabs";

// 지금 보는 학년 범위 안내 (category 가 undefined 면 범위 줄을 숨김)
function scopeText(category: string) {
  const scope = parseTeacherCategory(category);
  if (!category || !scope) return "전체 과목·학년 자료";
  const where = `${scope.area} › ${teacherScopeLabel(scope)}`;
  if (!scope.stage) return `${where} — ${scope.area}의 모든 자료`;
  if (!scope.grade) return `${where} — ${scope.stage} 모든 학년 자료와 전 학년 자료`;
  return `${where} — ${scope.stage} 전체·전 학년 자료도 함께`;
}

// 교사·강사 탭 상단 안내 — 이 탭에 어떤 자료가 있는지(앞으로 무엇을 올릴지) 한눈에
export function TeacherTabIntro({ tab, category }: { tab: string; category?: string }) {
  const info = TEACHER_TAB_INFO[tab];
  if (!info) return null;
  return (
    <div className="mb-4 sm:mb-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-sm sm:text-base text-gray-700">{info.description}</p>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {info.examples.map((example) => (
          <span key={example} className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
            {example}
          </span>
        ))}
      </div>
      {category !== undefined && (
        <p className="mt-2 text-xs text-cyan-700">보는 범위: {scopeText(category)}</p>
      )}
      {info.upcoming && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 text-amber-500" />
            숙제 검사 기능 (준비 중)
          </p>
          <ul className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500 list-disc pl-5">
            {info.upcoming.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
