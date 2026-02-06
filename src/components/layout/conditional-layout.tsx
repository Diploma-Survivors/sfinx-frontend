'use client';

import { Footer, Header } from '@/components/layout';
import GlobalLoader from '@/components/ui/global-loader';
import { useApp } from '@/contexts/app-context';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { shouldHideNavigation, isLoading } = useApp();

  if (isLoading) {
    return <GlobalLoader />;
  }



  if (shouldHideNavigation) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="">{children}</main>
      <Footer />
    </>
  );
}
