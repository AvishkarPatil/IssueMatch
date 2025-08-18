"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import client-only component with SSR disabled
const SearchPageClient = dynamic(() => import("@/components/SearchPageClient"), {
  ssr: false,
  loading: () => <p>Loading...</p>, // Optional fallback while component loads
});

export default function SearchPage() {
  return (
    <Suspense fallback={<p>Loading search page...</p>}>
      <SearchPageClient />
    </Suspense>
  );
}
