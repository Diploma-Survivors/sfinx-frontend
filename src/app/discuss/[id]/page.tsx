
import { DiscussDetail } from '@/components/discuss/posts/discuss-detail';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function DiscussDetailPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <DiscussDetail postId={id} />
        </div>
    );
}
