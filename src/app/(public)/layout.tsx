import MainFooter from "@/components/Footer";
import MainHeader from "@/components/Header";

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
