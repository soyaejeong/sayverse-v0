// src/app/record/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RecordPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Record Your Voice</h2>
            <Button size="lg" className="w-full">
              Start Recording
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}