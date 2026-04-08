// This layout overrides the parent applicant layout
// to render the register page WITHOUT a navigation bar
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
