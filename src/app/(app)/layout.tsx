import AppFooter from "@/components/AppFooter";
import AppHeader from "@/components/AppHeader";
import { getCurrentUser } from "@/services/firebase/admin";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <>
      <AppHeader currentUser={currentUser} />
      <main>{children}</main>
      <AppFooter />
    </>
  );
}
