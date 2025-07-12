import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DashboardPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <DashboardSidebar />
          </div>
          <div className="lg:col-span-3">
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardOverview />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
