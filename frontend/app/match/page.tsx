import { Slider } from "@/components/slider"
import { IssuesList } from "@/components/issues-list"
import { SortDropdown } from "@/components/sort-dropdown"
import { SortOptions } from "@/components/sort-options"
import { InspirationSidebar } from "@/components/inspiration-sidebar"
import { NavigationButtons } from "@/components/navigation-buttons"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pt-24 relative overflow-hidden">
      {/* Radial glow effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Hero Slider Section */}
        <Slider />

        {/* Navigation Buttons */}
        <div className="container mx-auto px-4 py-6">
          <NavigationButtons />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended</h2>
                <SortDropdown />
              </div>
              <IssuesList type="recommended" />
            </div>

            <div className="w-full lg:w-80 shrink-0 hidden lg:block">
              <div className="sticky top-24">
                <InspirationSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
