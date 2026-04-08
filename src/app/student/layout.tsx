import { StudentLayout } from '@/src/components/layout/StudentLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <StudentLayout>{children}</StudentLayout>;
}
