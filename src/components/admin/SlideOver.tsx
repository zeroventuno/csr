"use client";

export const fieldLabel =
  "text-[12.5px] font-bold uppercase tracking-[0.05em] text-muted";
export const fieldInput =
  "mt-[7px] h-[46px] w-full rounded-[11px] border border-border bg-surface-2 px-3.5 text-[15px] text-text outline-none focus:border-aqua";
export const fieldArea =
  "mt-[7px] w-full rounded-[11px] border border-border bg-surface-2 px-3.5 py-2.5 text-[15px] text-text outline-none focus:border-aqua";

export default function SlideOver({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100]">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(6,18,31,.5)] backdrop-blur-[2px]"
      />
      <div className="absolute inset-y-0 right-0 flex w-[min(640px,100%)] flex-col bg-surface shadow-[-20px_0_60px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-2xl text-text">{title}</h2>
            {subtitle && (
              <div className="text-[12.5px] text-muted">{subtitle}</div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="grid h-10 w-10 place-items-center rounded-[10px] border border-border bg-surface-2 text-lg text-text"
          >
            <i className="ph ph-x" />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-6">
          {children}
        </div>
        {footer && (
          <div className="flex items-center gap-3 border-t border-border px-6 py-[18px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
