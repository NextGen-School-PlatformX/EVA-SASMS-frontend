import { RouteGuard } from '@/src/components/auth/RouteGuard';

export default function ApplicantSupportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard requiredRole="APPLICANT">
            {children}
        </RouteGuard>
    );
}
