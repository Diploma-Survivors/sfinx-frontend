'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProblemRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const problemId = params.id as string;

  useEffect(() => {
    router.replace(`/problems/${problemId}/description`);
  }, [problemId, router]);

  return null;
}
