import { X } from "lucide-react";
import { Button } from "./components/ui/button";

interface Component4PageProps {
  onClose: () => void;
}

export default function Component4Page({ onClose }: Component4PageProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Iframe Content - Full Screen without header */}
      <div className="flex-1 overflow-hidden relative">
        {/* Close button positioned over iframe */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-10 w-10 p-0 bg-white hover:bg-gray-100 shadow-lg rounded-full"
        >
          <X className="h-6 w-6" />
        </Button>
        
        <iframe
          src="https://style-open-84094472.figma.site"
          className="w-full h-full border-0"
          title="SAT Content"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
