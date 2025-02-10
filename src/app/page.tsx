// src/app/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">
          Share Your Voice with the World
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Record and share your voice moments easily.
        </p>
        <Button asChild size="lg">
          <Link href="/record">Start Recording</Link>
        </Button>
      </div>
    </div>
  );
}