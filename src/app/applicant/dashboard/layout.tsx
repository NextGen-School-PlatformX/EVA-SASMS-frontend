import { RouteGuard } from '@/src/components/auth/RouteGuard';

export default function ApplicantDashboardLayout({
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
