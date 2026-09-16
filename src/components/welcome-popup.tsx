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

const SESSION_KEY = "veltrano:welcome-popup";

export function WelcomePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "shown") return;
    const t = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, "shown");
    }, 5000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            −10% sur ta première commande
          </DialogTitle>
          <DialogDescription>
            Laisse ton email. On t’écrit quand les nouveautés drop — Homme maintenant,
            Femme très bientôt.
          </DialogDescription>
        </DialogHeader>
        <EmailCapture idPrefix="popup" />
      </DialogContent>
    </Dialog>
  );
}
