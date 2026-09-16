"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailCapture } from "@/components/email-capture";

const DISMISSED_KEY = "veltrano:welcome-popup-dismissed";
const DELAY_MS = 5000;

export function WelcomePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY) === "1") return;
    const wait = Math.max(0, DELAY_MS - performance.now());
    const t = window.setTimeout(() => setOpen(true), wait);
    return () => window.clearTimeout(t);
  }, []);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) sessionStorage.setItem(DISMISSED_KEY, "1");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            −10% sur ta première commande
          </DialogTitle>
          <DialogDescription>
            Laisse ton email. On t’écrit dès que les nouveautés arrivent — Homme
            maintenant, Femme très bientôt.
          </DialogDescription>
        </DialogHeader>
        <EmailCapture idPrefix="popup" />
      </DialogContent>
    </Dialog>
  );
}
