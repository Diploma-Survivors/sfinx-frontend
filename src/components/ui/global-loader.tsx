'use client';

import Image from 'next/image';

export default function GlobalLoader() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Image
                src="/logo.svg"
                alt="SfinX"
                width={80}
                height={80}
                className="animate-pulse"
            />
        </div>
    );
}
