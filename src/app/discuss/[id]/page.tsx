
import { DiscussDetail } from '@/components/discuss/posts/discuss-detail';

interface PageProps {
    params: {
        id: string;
    };
}

// In Next.js 15, params is expected to be a promise in async layouts/pages, 
// but for standard pages in older versions it's an object. 
// Assuming standard Next.js App Router behavior here where params are automatically available.
export default function DiscussDetailPage({ params }: PageProps) {
    return (
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <DiscussDetail postId={params.id} />
        </div>
    );
}
