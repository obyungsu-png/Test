interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

// Lightning bolt icon - SaveMyExams style
function LightningIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13.5 1L2 18h8.5L9 31l13-18h-9L13.5 1z"
        fill="#00bcd4"
      />
    </svg>
  );
}

export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const sizeConfig = {
    xs: { icon: 'w-4 h-5', text: 'text-sm', gap: 'gap-0.5' },
    sm: { icon: 'w-5 h-7', text: 'text-lg', gap: 'gap-1' },
    md: { icon: 'w-7 h-9', text: 'text-xl sm:text-2xl', gap: 'gap-1' },
    lg: { icon: 'w-8 h-10', text: 'text-2xl sm:text-3xl', gap: 'gap-1.5' },
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center ${config.gap} ${className}`}>
      <LightningIcon className={`${config.icon} flex-shrink-0`} />
      <span className={`${config.text} font-extrabold tracking-tight text-gray-900`}>
        AllMyExam
      </span>
    </div>
  );
}

// Small variant for footers - just the icon
export function BrandIcon({ className = "w-5 h-6" }: { className?: string }) {
  return <LightningIcon className={className} />;
}
