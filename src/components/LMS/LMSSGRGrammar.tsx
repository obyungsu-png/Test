import { useEffect, useState } from "react";
import { PenTool, BookOpen, Notebook, Save } from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  loadUnits,
  saveUnits,
  type GrammarUnit,
  SAMPLE_UNIT,
} from "../SGRGrammar/types";

/**
 * SGR Grammar 관리 페이지 (기본 뼈대).
 * - 단원 목록 확인 + 샘플 초기화
 * - Textbook / Workbook 유형 확인
 * - 상세 편집 UI는 추후 확장
 */
export default function LMSSGRGrammar() {
  const [units, setUnits] = useState<GrammarUnit[]>([]);

  useEffect(() => {
    setUnits(loadUnits());
  }, []);

  const resetSample = () => {
    saveUnits([{ ...SAMPLE_UNIT, id: SAMPLE_UNIT.id, updatedAt: Date.now() }]);
    setUnits(loadUnits());
    toast.success("샘플 단원으로 초기화했습니다.");
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
          <PenTool className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">SGR Grammar</h1>
          <p className="text-sm text-gray-500">
            수업용 문법 자료 · Textbook / Workbook 관리
          </p>
        </div>
        <button
          onClick={resetSample}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"
        >
          <Save className="w-4 h-4" />
          샘플 단원으로 초기화
        </button>
      </header>

      <section className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
        <h2 className="text-sm font-bold text-emerald-800 mb-1">사용 안내</h2>
        <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
          <li>단원을 열면 먼저 Textbook / Workbook 을 선택합니다.</li>
          <li>Textbook 의 첫 번째 유형은 <b>문법 writing</b> 입니다.</li>
          <li>Workbook 의 첫 번째 유형은 <b>문법 writing workbook</b> 이며 형식은 추후 등록됩니다.</li>
          <li>Textbook 에 사진을 업로드하면 이후 Workbook 도 자동 생성되는 흐름으로 확장할 예정입니다.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-800">등록된 단원 · {units.length}</h2>
        {units.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-gray-300 rounded-2xl text-gray-500 text-sm">
            등록된 단원이 없습니다. 위의 “샘플 단원으로 초기화”를 눌러 확인해보세요.
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {units.map((u) => (
              <li
                key={u.id}
                className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-black text-emerald-600">
                    Unit {u.unitNumber}
                  </span>
                  <span className="text-base font-bold text-gray-800">
                    {u.unitTitle}
                  </span>
                </div>
                {u.subtitle && (
                  <p className="text-xs text-gray-500 mb-2">{u.subtitle}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold text-emerald-700">Textbook</span>
                    <span className="ml-auto font-medium text-gray-600">
                      {u.textbook.types.length}개
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <Notebook className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-bold text-amber-700">Workbook</span>
                    <span className="ml-auto font-medium text-gray-600">
                      {u.workbook.types.length}개
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
