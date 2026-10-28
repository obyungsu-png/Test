import { BookOpen, PenLine, Languages, type LucideIcon } from "lucide-react";
import { SGR_SCHOOL_LABEL, type SGRSchool } from "../utils/sgrSchool";

// SGR Series 첫 화면 — 6개 SGR 탭을 3개 묶음으로 간결하게 보여준다.
const SGR_MENU_GROUPS: { title: string; icon: LucideIcon; iconClass: string; items: { tab: string; label: string }[] }[] = [
  {
    title: "Reading",
    icon: BookOpen,
    iconClass: "text-teal-600",
    items: [
      { tab: "SGR Novels", label: "Novels" },
      { tab: "SGR Class", label: "Class" },
    ],
  },
  {
    title: "Writing",
    icon: PenLine,
    iconClass: "text-violet-600",
    items: [
      { tab: "SGR Writing", label: "Writing" },
      { tab: "SGR Grammar", label: "Grammar" },
    ],
  },
  {
    title: "Vocabulary & Languages",
    icon: Languages,
    iconClass: "text-amber-600",
    items: [
      { tab: "SGR Voca", label: "Voca" },
      { tab: "SGR HSK", label: "HSK" },
    ],
  },
];

interface SGRSeriesMenuProps {
  school: SGRSchool;
  onSelect: (tab: string) => void;
}

export function SGRSeriesMenu({ school, onSelect }: SGRSeriesMenuProps) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">SGR Series</h2>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700">{SGR_SCHOOL_LABEL[school]}</span>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        {SGR_MENU_GROUPS.map(({ title, icon: Icon, iconClass, items }) => (
          <div key={title} className="flex items-start gap-3 px-4 sm:px-5 py-4">
            <Icon className={`w-5 h-5 mt-1 shrink-0 ${iconClass}`} />
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-gray-900">{title}</p>
              <div className="flex flex-wrap items-center gap-x-1 mt-0.5 text-sm sm:text-base text-gray-500">
                {items.map(({ tab, label }, i) => (
                  <span key={tab} className="flex items-center gap-x-1">
                    {i > 0 && <span aria-hidden="true">·</span>}
                    <button
                      onClick={() => onSelect(tab)}
                      className="px-1 py-0.5 -mx-1 rounded hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                    >
                      {label}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
