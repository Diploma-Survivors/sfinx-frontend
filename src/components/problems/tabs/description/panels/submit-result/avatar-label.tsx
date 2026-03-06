'use client';

interface AvatarLabelProps {
    x?: number;
    y?: number;
    width?: number;
    value?: number;
    avatarUrl?: string;
}

const AVATAR_SIZE = 28;

export function AvatarLabel({ x = 0, y = 0, width = 0, avatarUrl }: AvatarLabelProps) {
    if (!avatarUrl) return null;

    const cx = x + width / 2 - AVATAR_SIZE / 2;
    const cy = y - AVATAR_SIZE - 6;

    return (
        <foreignObject x={cx} y={cy} width={AVATAR_SIZE} height={AVATAR_SIZE} style={{ overflow: 'visible' }}>
            <div className="w-7 h-7 rounded-full ring-2 ring-white shadow-md overflow-hidden">
                <img
                    src={avatarUrl}
                    alt="You"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            </div>
        </foreignObject>
    );
}
