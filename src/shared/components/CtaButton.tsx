type CtaButtonProps = {
  label: string;
  gradient: string;
  onClick: () => void;
};

export function CtaButton({ label, gradient, onClick }: CtaButtonProps) {
  return (
    <div className="relative z-10 flex w-full flex-col items-center px-8 pb-12">
      <button
        onClick={onClick}
        className={`w-full rounded-full bg-gradient-to-r ${gradient} py-4 text-center text-lg font-semibold text-white shadow-lg transition-opacity hover:opacity-90 active:opacity-80`}
      >
        {label}
      </button>
    </div>
  );
}
