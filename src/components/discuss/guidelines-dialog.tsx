'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Shield, MessageSquare, Heart, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export function GuidelinesDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full text-xs h-8">
                    Read Guidelines
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        Community Guidelines
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground">
                        To ensure a great experience for everyone, please follow these rules.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/40">
                        <MessageSquare className="w-6 h-6 text-blue-500 mt-1" />
                        <div className="space-y-2">
                            <h4 className="font-semibold text-lg">Be Respectful</h4>
                            <p className="text-base text-muted-foreground/90">
                                Treat others with kindness. Harassment, hate speech, and personal attacks will not be tolerated.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/40">
                        <Heart className="w-6 h-6 text-red-500 mt-1" />
                        <div className="space-y-2">
                            <h4 className="font-semibold text-lg">Be Helpful</h4>
                            <p className="text-base text-muted-foreground/90">
                                Contributing meaningful content. Avoid spamming or posting irrelevant topics.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/40">
                        <Shield className="w-6 h-6 text-green-500 mt-1" />
                        <div className="space-y-2">
                            <h4 className="font-semibold text-lg">Original Content</h4>
                            <p className="text-base text-muted-foreground/90">
                                Share knowledge and original work. Please credit sources when sharing others' content.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                        <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1" />
                        <div className="space-y-2">
                            <h4 className="font-semibold text-lg text-yellow-700 dark:text-yellow-500">No Cheating</h4>
                            <p className="text-base text-yellow-700/80 dark:text-yellow-500/80">
                                Do not share solutions during active contests. Let's keep the competition fair.
                            </p>
                        </div>
                    </div>
                </div>
                <DialogFooter className="sm:justify-end">
                    <Button type="button" size="lg" className="text-base px-8" onClick={() => setOpen(false)}>
                        I Understand
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
