import { OpenSandwormButton } from "@/components/OpenSandwormButton";

export default function TerminalHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <h1 className="font-body text-3xl font-medium text-foreground">
        Sandworm Terminal
      </h1>
      <p className="font-body max-w-md text-ink-400">
        An extension of Sandworm. Same data, same accounts, built for speed.
      </p>
      <OpenSandwormButton />
    </main>
  );
}
