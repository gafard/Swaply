export default function LocaleLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_60px_rgba(16,32,58,0.12)] backdrop-blur-xl">
        <div className="space-y-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-9 w-44 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-24 animate-pulse rounded-[24px] bg-slate-100" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-28 animate-pulse rounded-[22px] bg-slate-100" />
            <div className="h-28 animate-pulse rounded-[22px] bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
