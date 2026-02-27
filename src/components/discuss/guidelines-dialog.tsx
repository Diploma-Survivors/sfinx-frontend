"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Shield, MessageSquare, Heart, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function GuidelinesDialog() {
  const { t } = useTranslation("discuss");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full text-xs h-8">
          {t("read_guidelines")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            {t("community_guidelines")}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {t("guidelines_intro")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/40">
            <MessageSquare className="w-6 h-6 text-blue-500 mt-1" />
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">{t("be_respectful")}</h4>
              <p className="text-base text-muted-foreground/90">
                {t("be_respectful_desc")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/40">
            <Heart className="w-6 h-6 text-red-500 mt-1" />
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">{t("be_helpful")}</h4>
              <p className="text-base text-muted-foreground/90">
                {t("be_helpful_desc")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/40">
            <Shield className="w-6 h-6 text-green-500 mt-1" />
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">{t("original_content")}</h4>
              <p className="text-base text-muted-foreground/90">
                {t("original_content_desc")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1" />
            <div className="space-y-2">
              <h4 className="font-semibold text-lg text-yellow-700 dark:text-yellow-500">
                {t("no_cheating")}
              </h4>
              <p className="text-base text-yellow-700/80 dark:text-yellow-500/80">
                {t("no_cheating_desc")}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            size="lg"
            className="text-base px-8"
            onClick={() => setOpen(false)}
          >
            {t("i_understand")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
