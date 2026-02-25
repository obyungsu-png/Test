import { X, Crown } from "lucide-react";
import { Button } from "./components/ui/button";

interface Component5PageProps {
  onClose: () => void;
}

export default function Component5Page({ onClose }: Component5PageProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Iframe Content - Full Screen without header */}
      <div className="flex-1 overflow-hidden relative">
        {/* Top bar with label and close button */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-3 py-1.5 rounded-full shadow-lg text-sm font-medium">
            <Crown className="h-4 w-4" />
            <span>VIP 콘텐츠룸</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0 bg-white hover:bg-gray-100 shadow-lg rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <iframe
          src="https://gong-notch-50924897.figma.site"
          className="w-full h-full border-0"
          title="VIP Content Room - International School"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}