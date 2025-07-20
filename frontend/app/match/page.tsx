import { Slider } from "@/components/slider"
import { IssuesList } from "@/components/issues-list"
import { SortDropdown } from "@/components/sort-dropdown"
import { SortOptions } from "@/components/sort-options"
import { InspirationSidebar } from "@/components/inspiration-sidebar"
import { NavigationButtons } from "@/components/navigation-buttons"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      {/* Hero Slider Section */}
      <Slider />

      {/* Navigation Buttons */}
      <div className="container mx-auto px-4 py-6">
        <NavigationButtons />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sort Options - Hidden on mobile */}
          {/*<div className="w-full lg:w-80 shrink-0 hidden lg:block">*/}
          {/*  <div className="sticky top-4">*/}
          {/*    <SortOptions />*/}
          {/*  </div>*/}
          {/*</div>*/}

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Recommended</h2>
              <SortDropdown />
            </div>
            <IssuesList type="recommended" />
          </div>

          <div className="w-full lg:w-80 shrink-0 hidden lg:block">
            <div className="sticky top-4">
              <InspirationSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {/*<Footer />*/}
    </main>
  )
}
