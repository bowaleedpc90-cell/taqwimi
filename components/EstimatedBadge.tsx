export function EstimatedBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block rounded bg-religious/15 px-1 text-[9px] font-bold leading-tight text-religious ${className}`}
    >
      تقديري
    </span>
  );
}
