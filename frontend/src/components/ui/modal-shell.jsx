import React from 'react';

const join = (...parts) => parts.filter(Boolean).join(' ');

const baseOverlayCls = [
  'fixed inset-0 z-[1000] bg-black/60 backdrop-blur-[6px]',
  'flex items-center justify-center p-4',
  'animate-[g-fadeIn_0.2s_ease]'
].join(' ');

const baseContentCls = [
  'w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]',
  'shadow-[0_20px_60px_rgba(0,0,0,0.28)] overflow-hidden',
  'animate-[g-fadeInScale_0.24s_ease]',
  'dark:border-[var(--color-border)] dark:bg-[var(--color-bg-secondary)]'
].join(' ');

const baseHeaderCls = [
  'flex items-center justify-between gap-3',
  'border-b border-[var(--color-border)] px-5 py-4',
  'dark:border-[var(--color-border)]'
].join(' ');

const baseCloseBtnCls = [
  'bg-transparent border border-[var(--color-border)]',
  'w-9 h-9 rounded-lg text-[20px] leading-none',
  'cursor-pointer transition-all duration-200 text-[var(--color-text-secondary)]',
  'hover:enabled:bg-red-500 hover:enabled:text-white hover:enabled:border-red-500',
  'disabled:opacity-50 disabled:cursor-not-allowed'
].join(' ');

function ModalShell({
  onClose,
  title,
  icon,
  children,
  contentClassName,
  headerClassName,
  bodyClassName,
  closeBtnClassName,
  closeDisabled = false,
}) {
  return (
    <div className={baseOverlayCls} onClick={onClose}>
      <div className={join(baseContentCls, contentClassName)} onClick={(e) => e.stopPropagation()}>
        <div className={join(baseHeaderCls, headerClassName)}>
          <h2 className="m-0 inline-flex items-center gap-2 text-xl font-bold text-[var(--color-text-primary)] max-md:text-lg">
            {icon}
            {title}
          </h2>
          <button className={join(baseCloseBtnCls, closeBtnClassName)} onClick={onClose} disabled={closeDisabled}>
            x
          </button>
        </div>
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>
  );
}

export default ModalShell;
