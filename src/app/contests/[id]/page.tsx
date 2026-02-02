'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ContestRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const contestId = params.id as string;

  useEffect(() => {
    router.replace(`/contests/${contestId}/description`);
  }, [contestId, router]);

  return null;
}
