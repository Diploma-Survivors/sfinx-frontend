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

interface ReportProblemModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    problemId: number;
}

const reportTypeLabels: Record<ProblemReportType, string> = {
    [ProblemReportType.WRONG_DESCRIPTION]: "Wrong Description",
    [ProblemReportType.WRONG_ANSWER]: "Wrong Answer / Expected Output",
    [ProblemReportType.WRONG_TEST_CASE]: "Wrong Test Case",
    [ProblemReportType.OTHER]: "Other",
};

export function ReportProblemModal({
    isOpen,
    onOpenChange,
    problemId,
}: ReportProblemModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [type, setType] = useState<ProblemReportType | "">("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!type) {
            setError("Please select a report type.");
            return;
        }

        if (description.length < 10) {
            setError("Description must be at least 10 characters.");
            return;
        }

        try {
            setIsSubmitting(true);
            await ProblemReportService.createReport({
                problemId,
                type: type as ProblemReportType,
                description,
            });
            toastService.success("Problem reported successfully. Thank you for your feedback!");
            setType("");
            setDescription("");
            onOpenChange(false);
        } catch (err) {
            toastService.error("Failed to submit report. Please try again.");
            console.error("Error creating report:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Report an Issue</DialogTitle>
                    <DialogDescription>
                        Help us improve by reporting any issues with this problem.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Issue Type</Label>
                        <Select
                            value={type}
                            onValueChange={(value) => setType(value as ProblemReportType)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an issue type" />
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
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Please provide details about the issue..."
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
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Report"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
