import { BookOpen, PenLine, SpellCheck, Languages, type LucideIcon } from "lucide-react";
import { SGR_SCHOOL_LABEL, type SGRSchool } from "../utils/sgrSchool";

const SGR_SECTIONS: { tab: string; label: string; icon: LucideIcon; iconClass: string }[] = [
  { tab: "SGR Novels", label: "Novels", icon: BookOpen, iconClass: "text-teal-600" },
  { tab: "SGR Writing", label: "Writing", icon: PenLine, iconClass: "text-violet-600" },
  { tab: "SGR Grammar", label: "Grammar", icon: SpellCheck, iconClass: "text-emerald-600" },
  { tab: "SGR Voca", label: "Voca", icon: Languages, iconClass: "text-amber-600" },
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
      <nav aria-label="SGR Series 자료" className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        {SGR_SECTIONS.map(({ tab, label, icon: Icon, iconClass }) => (
          <button
            key={tab}
            type="button"
            onClick={() => onSelect(tab)}
            className="flex w-full items-center gap-3 px-4 sm:px-5 py-4 text-left text-base sm:text-lg font-bold text-gray-900 hover:bg-cyan-50 hover:text-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-600 first:rounded-t-xl last:rounded-b-xl transition-colors"
          >
            <Icon className={`w-5 h-5 shrink-0 ${iconClass}`} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
