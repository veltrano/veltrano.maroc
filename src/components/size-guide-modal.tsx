"use client";

import { useEffect, useId, useRef } from "react";
import type { Fit } from "@/data/catalog";
import { sizeGuideForFit } from "@/data/size-guides";
import { useI18n } from "@/lib/i18n/provider";

const METHOD_AR: Record<Fit, string> = {
  baggy:
    "قياسات الجينز مسطّحًا (سم)، وفق العلامات A–D في الدليل. A: الخصر. B: الحوض. C: فتحة الساق. D: الطول. المقاسات المتاحة للشراء تبقى كما في مخزون الموديل.",
  straight:
    "قياسات الجينز مسطّحًا (سم)، وفق العلامات A–D في الدليل. A: الخصر. B: الحوض. C: فتحة الساق. D: الطول. المقاسات المتاحة للشراء تبقى كما في مخزون الموديل.",
};

const TITLE_AR: Record<Fit, string> = {
  baggy: "دليل المقاسات — باجي",
  straight: "دليل المقاسات — قصّة مستقيمة",
};

export function SizeGuideModal({
  fit,
  open,
  onClose,
}: {
  fit: Fit;
  open: boolean;
  onClose: () => void;
}) {
  const guide = sizeGuideForFit(fit);
  const { t, locale } = useI18n();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const title = locale === "ar" ? TITLE_AR[fit] : guide.modalTitle;
  const method = locale === "ar" ? METHOD_AR[fit] : guide.methodNote;
  const cutLabel =
    locale === "ar"
      ? fit === "baggy"
        ? "باجي"
        : "قصّة مستقيمة"
      : fit === "baggy"
        ? "Baggy"
        : "Coupe droite";

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => closeRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 id={titleId} className="font-heading text-lg sm:text-xl">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
          >
            {t("sizeGuide.close")}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <p className="text-sm text-muted-foreground">{method}</p>

          <div className="mt-4 overflow-auto rounded-xl border border-border bg-neutral-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={guide.imageSrc}
              alt={guide.imageAlt}
              className="mx-auto max-h-[70vh] w-full origin-top object-contain sm:max-h-none"
            />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-sm">
              <caption className="mb-2 text-start font-medium">
                {t("sizeGuide.tableCaption", { cut: cutLabel })}
              </caption>
              <thead>
                <tr className="border-b border-border text-start">
                  <th scope="col" className="py-2 pe-3 font-medium">
                    {t("sizeGuide.sizeCol")}
                  </th>
                  {guide.columns.map((col) => (
                    <th key={col.key} scope="col" className="py-2 pe-3 font-medium">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.rows.map((row) => (
                  <tr key={row.size} className="border-b border-border/70">
                    <th scope="row" className="py-2 pe-3 text-start font-medium">
                      {row.size}
                    </th>
                    <td className="py-2 pe-3">{row.a}</td>
                    <td className="py-2 pe-3">{row.b}</td>
                    <td className="py-2 pe-3">{row.c}</td>
                    <td className="py-2 pe-3">{row.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
