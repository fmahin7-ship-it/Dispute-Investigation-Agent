"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  title: string;
  docName: string;
  content: string;
};

/** PDF-style policy sheet — markdown rendered, frontend-only. */
export function PolicyDocument({ title, docName, content }: Props) {
  return (
    <article className="policy-pdf mx-auto max-w-[52rem]">
      <header className="policy-pdf-header">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Internal policy document
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold leading-snug text-ink sm:text-[1.75rem]">
              {title}
            </h1>
          </div>
          <p className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            Confidential
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
          <span className="font-mono">{docName}</span>
          <span>For investigation reference only</span>
        </div>
      </header>

      <div className="policy-prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>

      <footer className="policy-pdf-footer">
        End of document · Do not use as automatic refund authority
      </footer>
    </article>
  );
}
