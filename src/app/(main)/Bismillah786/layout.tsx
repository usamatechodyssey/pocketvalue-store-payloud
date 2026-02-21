import AdminLayoutClient from "./(dashboard)/_components/AdminLayoutClient";

// This file is now just a wrapper. All logic is in the client component.
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
