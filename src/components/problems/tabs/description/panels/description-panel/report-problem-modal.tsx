"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProblemReportType } from "@/types/problem-reports";
import { ProblemReportService } from "@/services/problem-report-service";
import { toastService } from "@/services/toasts-service";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface ReportProblemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  problemId: number;
}

export function ReportProblemModal({
  isOpen,
  onOpenChange,
  problemId,
}: ReportProblemModalProps) {
  const { t } = useTranslation("problems");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<ProblemReportType | "">("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const reportTypeLabels: Record<ProblemReportType, string> = {
    [ProblemReportType.WRONG_DESCRIPTION]: t("report_type_wrong_description"),
    [ProblemReportType.WRONG_ANSWER]: t("report_type_wrong_answer"),
    [ProblemReportType.WRONG_TEST_CASE]: t("report_type_wrong_test_case"),
    [ProblemReportType.OTHER]: t("other"),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!type) {
      setError(t("error_select_type"));
      return;
    }

    if (description.length < 10) {
      setError(t("error_description_length"));
      return;
    }

    try {
      setIsSubmitting(true);
      await ProblemReportService.createReport({
        problemId,
        type: type as ProblemReportType,
        description,
      });
      toastService.success(t("report_success"));
      setType("");
      setDescription("");
      onOpenChange(false);
    } catch (err) {
      toastService.error(t("report_failed"));
      console.error("Error creating report:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("report_issue_title")}</DialogTitle>
          <DialogDescription>{t("report_issue_description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("issue_type")}</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as ProblemReportType)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("select_issue_type")} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProblemReportType).map((t) => (
                  <SelectItem key={t} value={t}>
                    {reportTypeLabels[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("description")}</Label>
            <Textarea
              placeholder={t("issue_description_placeholder")}
              className="min-h-[100px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                t("submit_report")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
