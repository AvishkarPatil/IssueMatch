"use client";

import dynamic from "next/dynamic"

const SearchPageClient = dynamic(() => import("@/components/SearchPageClient"), {
  ssr: false,
})

export default function SearchPage() {
  return <SearchPageClient />
}