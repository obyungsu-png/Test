import { useState, useEffect } from "react";

export function ContentRightSidebar() {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollableElement = document.getElementById('scrollable-content');
      if (scrollableElement) {
        const scrollTop = scrollableElement.scrollTop;
        const scrollHeight = scrollableElement.scrollHeight - scrollableElement.clientHeight;
        const percentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollPercentage(percentage);
      }
    };

    const scrollableElement = document.getElementById('scrollable-content');
    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', handleScroll);
      return () => scrollableElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollBarHeight = 40; // percentage of track height
  const trackHeight = 400; // px
  const maxTop = trackHeight * (1 - scrollBarHeight / 100);
  const topPosition = (scrollPercentage / 100) * maxTop;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-10">
      {/* Track */}
      <div 
        className="relative bg-gray-300/60"
        style={{ height: `${trackHeight}px`, width: '2px' }}
      >
        {/* Scrollbar thumb */}
        <div 
          className="absolute left-0 bg-gray-600 transition-all duration-100"
          style={{ 
            height: `${scrollBarHeight}%`,
            top: `${topPosition}px`,
            width: '2px'
          }}
        />
      </div>
    </div>
  );
}
