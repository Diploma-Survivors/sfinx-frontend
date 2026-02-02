'use client';

export default function GlobalLoader() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="relative flex flex-col items-center justify-center animate-pulse">
                <span className="text-6xl font-bold tracking-tight text-primary">
                    SfinX
                </span>
            </div>
        </div>
    );
}
