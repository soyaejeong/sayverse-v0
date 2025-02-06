// src/components/shared/header.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-2xl">
          SayVerse
        </Link>
        <nav>
          <Button asChild variant="ghost">
            <Link href="/record">Record</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}