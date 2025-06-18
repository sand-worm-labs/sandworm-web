import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 px-2 py-2 md:px-4 w-full">
        <p className="text-center w-full flex-1 text-xs text-zinc-400 dark:text-zinc-600">
          By messaging, you agree to our{" "}
          <Link href="/terms" className="underline" target="_blank">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline" target="_blank">
            Privacy Policy
          </Link>
          .
        </p>
    </footer>
  );
}
