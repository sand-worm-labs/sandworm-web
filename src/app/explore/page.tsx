import Head from "next/head";
import Header from "@/components/Header";
import TabsSection from "@/components/TabsSection";
import { getCurrentUser } from "@/services/firebase/admin";

export default async function Explore() {
  const user = await getCurrentUser();

  const currentUser = user
    ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }
    : null;

  return (
    <div className="dark text-white min-h-screen">
      <Head>
        <title>Explore</title>
      </Head>
      <Header currentUser={currentUser} />
      <div className="pt-10">
        <TabsSection />
      </div>
    </div>
  );
}
