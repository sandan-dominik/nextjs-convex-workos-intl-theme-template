import { AutumnWrapper } from '@/app/(protected)/_components/autumn-wrapper';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AutumnWrapper loadingVariant="none">
      {children}
    </AutumnWrapper>
  );
}