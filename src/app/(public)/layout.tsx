import { MainFooter } from "@/components/Layout/Footer";
import { MainHeader } from "@/components/Layout/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainHeader />
      <main className="min-h-[70vh]">{children}</main>
      <MainFooter />
    </>
  );
}
