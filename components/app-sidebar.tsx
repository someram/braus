"use client"

import * as React from "react"
import { OrganizationSwitcher, UserButton, useAuth } from "@clerk/react"
import { useNavigate } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { WorkflowNav } from "@/features/workflows/components/workflow-nav"
import type { Workflow } from "@/lib/db/schema"
import { apiFetch } from "@/src/lib/api"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { getToken, orgId } = useAuth()
  const navigate = useNavigate()
  const [workflows, setWorkflows] = React.useState<Workflow[]>([])

  React.useEffect(() => {
    if (!orgId) { setWorkflows([]); return }
    let active = true
    void getToken().then((token) => apiFetch<Workflow[]>(token, "/api/workflows")).then((items) => active && setWorkflows(items)).catch(() => active && setWorkflows([]))
    return () => { active = false }
  }, [getToken, orgId])

  const createWorkflow = async (name: string) => {
    const token = await getToken()
    const workflow = await apiFetch<Workflow>(token, "/api/workflows", { method: "POST", body: JSON.stringify({ name }) })
    setWorkflows((current) => [workflow, ...current])
    navigate(`/dashboard/workflows/${workflow.id}`)
  }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader className="flex-row items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
        <OrganizationSwitcher
          afterCreateOrganizationUrl="/"
          afterSelectOrganizationUrl="/"
          afterLeaveOrganizationUrl="/"
          hidePersonal
          appearance={{
            elements: {
              rootBox: "min-w-0 group-data-[collapsible=icon]:!hidden",
              organizationSwitcherTrigger: "w-full justify-between",
            },
          }}
        />
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <WorkflowNav
          workflows={workflows}
          onCreateWorkflow={createWorkflow}
        />
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:items-center">
        <ThemeToggle className="group-data-[collapsible=icon]:mx-auto" />
        <UserButton
          appearance={{
            elements: {
              rootBox: "w-full",
              userButtonTrigger:
                "w-full justify-start group-data-[collapsible=icon]:justify-center",
              userButtonOuterIdentifier: "group-data-[collapsible=icon]:hidden",
            },
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
