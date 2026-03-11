'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Crown } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const { t } = useTranslation('common');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col items-center gap-4 text-center">
                    <div className="rounded-full bg-yellow-500/10 p-3">
                        <Crown className="h-8 w-8 text-yellow-500" />
                    </div>
                    <DialogTitle className="text-xl">{t('premium_content')}</DialogTitle>
                    <DialogDescription className="text-center text-base">
                        {t('premium_content_desc')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-col gap-2 mt-4">
                    <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold">
                        <Link href="/pricing">
                            {t('upgrade_to_premium')}
                        </Link>
                    </Button>
                    <Button variant="ghost" onClick={onClose} className="w-full">
                        {t('maybe_later')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
