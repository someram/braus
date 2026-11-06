"use client"

import { useTransition } from "react"
import { useAuth } from "@clerk/react"
import { useNavigate } from "react-router-dom"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { apiFetch } from "@/src/lib/api"
import type { Workflow } from "@/lib/db/schema"
import { generateSlug } from "@/features/workflows/lib/generate-slug"

export function NewWorkflowButton() {
  const [isPending, startTransition] = useTransition()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const handleCreateWorkflow = () => {
    startTransition(async () => {
      const token = await getToken()
      const workflow = await apiFetch<Workflow>(token, "/api/workflows", { method: "POST", body: JSON.stringify({ name: generateSlug() }) })
      navigate(`/dashboard/workflows/${workflow.id}`)
    })
  }

  return (
    <Button onClick={handleCreateWorkflow} disabled={isPending}>
      <PlusIcon />
      New workflow
    </Button>
  )
}
