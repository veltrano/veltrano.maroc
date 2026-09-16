"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailCapture } from "@/components/email-capture";
import { useI18n } from "@/lib/i18n/provider";

const DISMISSED_KEY = "veltrano:welcome-popup-dismissed";
const DELAY_MS = 5000;

export function WelcomePopup() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const disabled = pathname.startsWith("/admin");

  useEffect(() => {
    if (disabled) return;
    if (sessionStorage.getItem(DISMISSED_KEY) === "1") return;
    const wait = Math.max(0, DELAY_MS - performance.now());
    const t = window.setTimeout(() => setOpen(true), wait);
    return () => window.clearTimeout(t);
  }, [disabled]);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) sessionStorage.setItem(DISMISSED_KEY, "1");
  }

  if (disabled) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{t("popup.title")}</DialogTitle>
          <DialogDescription>{t("popup.body")}</DialogDescription>
        </DialogHeader>
        <EmailCapture idPrefix="popup" />
      </DialogContent>
    </Dialog>
  );
}
