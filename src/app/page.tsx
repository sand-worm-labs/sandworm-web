import Link from "next/link";

import MainLayout from "@/layouts/MainLayout/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      <section className="p-8 flex flex-col h-full justify-center items-center text-center">
        <h1 className="text-3xl font-bold font-poppins">Sandworm ⚡</h1>
        <p className="text-lg"> Home Page Goes here </p>
        <Link href="/explore">Explore</Link>
      </section>
    </MainLayout>
  );
}
