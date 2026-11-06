import { Outlet } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function Dashboard() {
  return <SidebarProvider className="h-svh"><AppSidebar /><SidebarInset className="min-h-0 overflow-hidden border shadow-none!">
    <Outlet />
  </SidebarInset></SidebarProvider>
}
