import Link from "next/link";
import { getLocale } from "next-intl/server";

import AppLogo from "@/components/AppLogo";
import { termsDocument } from "@/content/terms";
import { localizeHref } from "@/lib/i18n/pathnames";

export default async function TermsPage() {
  const locale = await getLocale();

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <AppLogo size={52} />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Document légal
            </p>
            <h1 className="font-display text-3xl font-bold tracking-[-0.05em] text-slate-950">
              {termsDocument.title}
            </h1>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>Version {termsDocument.version}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            <span>Mise à jour: {termsDocument.updatedAtLabel}</span>
          </div>
          <p className="mt-4 text-base leading-7 text-slate-700">{termsDocument.intro}</p>
        </div>

        <article className="space-y-4">
          {termsDocument.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
            >
              <h2 className="font-display text-xl font-bold tracking-[-0.04em] text-slate-950">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-slate-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </article>

        <div className="pb-6">
          <Link
            href={localizeHref(locale, "/signup")}
            className="inline-flex items-center rounded-[22px] border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 transition-all hover:bg-slate-50"
          >
            Retour à l&apos;inscription
          </Link>
        </div>
      </div>
    </main>
  );
}
