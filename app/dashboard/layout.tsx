'use client';

import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar Navigation */}
          <DashboardSidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
