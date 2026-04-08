export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-base-100 overflow-x-hidden h-full w-full relative p-0 m-0">
      <main className="min-h-[70vh] w-full relative">{children}</main>
    </div>
  );
}
