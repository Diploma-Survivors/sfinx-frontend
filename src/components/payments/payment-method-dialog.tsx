"use client";

import { useEffect, useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PaymentService } from "@/services/payments-service";
import type { PaymentMethodInfo } from "@/types/payment";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface PaymentMethodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (paymentMethod: number) => void;
    loading?: boolean;
    lang?: string;
}

export function PaymentMethodDialog({
    open,
    onOpenChange,
    onConfirm,
    loading = false,
    lang,
}: PaymentMethodDialogProps) {
    const { t } = useTranslation("common");
    const [methods, setMethods] = useState<PaymentMethodInfo[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
    const [fetchingMethods, setFetchingMethods] = useState(false);

    useEffect(() => {
        if (!open) return;

        const fetchMethods = async () => {
            setFetchingMethods(true);
            try {
                const data = await PaymentService.getPaymentMethods(lang);
                setMethods(data);
                if (data.length > 0 && selectedMethod === null) {
                    setSelectedMethod(data[0].method);
                }
            } catch {
                setMethods([]);
            } finally {
                setFetchingMethods(false);
            }
        };

        fetchMethods();
    }, [open, lang]);

    const handleConfirm = () => {
        if (selectedMethod !== null) {
            onConfirm(selectedMethod);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        {t("select_payment_method", {
                            defaultValue: "Select Payment Method",
                        })}
                    </DialogTitle>
                    <DialogDescription>
                        {t("choose_payment_method_desc", {
                            defaultValue:
                                "Choose your preferred payment method to proceed with the subscription.",
                        })}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-3">
                    {fetchingMethods ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : methods.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">
                            {t("no_payment_methods", {
                                defaultValue: "No payment methods available.",
                            })}
                        </p>
                    ) : (
                        methods.map((method) => (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => setSelectedMethod(method.method)}
                                className={cn(
                                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                                    selectedMethod === method.method
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border/50 hover:border-border hover:bg-muted/30"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center",
                                        selectedMethod === method.method
                                            ? "bg-primary/10"
                                            : "bg-muted"
                                    )}
                                >
                                    {method.iconUrl ? (
                                        <img
                                            src={method.iconUrl}
                                            alt={method.name}
                                            className="w-8 h-8 object-contain"
                                        />
                                    ) : (
                                        <CreditCard
                                            className={cn(
                                                "h-5 w-5",
                                                selectedMethod === method.method
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            )}
                                        />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p
                                        className={cn(
                                            "font-semibold text-sm",
                                            selectedMethod === method.method
                                                ? "text-primary"
                                                : "text-foreground"
                                        )}
                                    >
                                        {method.name}
                                    </p>
                                    {method.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                            {method.description}
                                        </p>
                                    )}
                                </div>

                                <div
                                    className={cn(
                                        "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                        selectedMethod === method.method
                                            ? "border-primary bg-primary"
                                            : "border-muted-foreground/30"
                                    )}
                                >
                                    {selectedMethod === method.method && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {t("cancel", { defaultValue: "Cancel" })}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedMethod === null || loading || fetchingMethods}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25"
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {t("proceed_to_payment", { defaultValue: "Proceed to Payment" })}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
