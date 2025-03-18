import AppFooter from "@/components/AppFooter";
import AppHeader from "@/components/AppHeader";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      <main>{children}</main>
      <AppFooter />
    </>
  );
}
