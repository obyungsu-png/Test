import { motion } from "motion/react";
import { Badge } from "../ui/badge";
import { LucideIcon } from "lucide-react";

interface DownloadOptionButtonProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  isNew?: boolean;
  onClick: (id: string, title: string) => void;
  className?: string;
}

export function DownloadOptionButton({
  id,
  title,
  description,
  icon: IconComponent,
  color,
  isNew,
  onClick,
  className = ""
}: DownloadOptionButtonProps) {
  return (
    <motion.button
      onClick={() => onClick(id, title)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 text-left group ${className}`}
    >
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
        <IconComponent className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      {isNew && (
        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          New
        </Badge>
      )}
    </motion.button>
  );
}