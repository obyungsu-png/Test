import { Clock } from "lucide-react";
import { TEACHER_TAB_INFO } from "./constants/teacherTabs";

// 교사·강사 탭 상단 안내 — 이 탭에 어떤 자료가 있는지(앞으로 무엇을 올릴지) 한눈에
export function TeacherTabIntro({ tab }: { tab: string }) {
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
