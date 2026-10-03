import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-6 text-center">
      <div className="h-16 w-16 rounded-3xl bg-accent text-accent-fg font-black text-2xl flex items-center justify-center mb-6">
        404
      </div>
      <h1 className="text-3xl font-black text-ink mb-2">Page Not Found</h1>
      <p className="text-sm text-ink-muted max-w-sm mb-8">
        The page you are looking for doesn&apos;t exist or has been moved to a new URL.
      </p>
      <Link href="/">
        <Button variant="primary" size="lg" className="font-bold">
          Return to Homepage
        </Button>
      </Link>
    </div>
  );
}
