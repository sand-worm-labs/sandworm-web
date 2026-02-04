import { MainFooter } from "@/components/Layout/Footer";
import { MainHeader } from "@/components/Layout/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black overflow-x-hidden h-full w-full relative p-0 m-0">
      <MainHeader />
      <main className="min-h-[70vh] w-full relative">{children}</main>
      <MainFooter />
    </div>
  );
}
