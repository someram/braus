import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "@clerk/react"
import { ReactFlowProvider } from "@xyflow/react"
import { Room } from "@/features/workflows/components/room"
import { WorkflowShell } from "@/features/workflows/components/workflow-shell"
import { WorkflowRunsProvider } from "@/features/workflows/components/workflow-runs-provider"

export function WorkflowPage() {
  const { id = "" } = useParams()
  const { getToken } = useAuth()
  const [accessToken, setAccessToken] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    void getToken().then(async (token) => {
      if (!token) throw new Error("Authentication required")
      const response = await fetch(`/api/workflows/${id}/session`, { headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw new Error(await response.text())
      const data = await response.json() as { runsToken: string }
      if (active) setAccessToken(data.runsToken)
    }).catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : "Could not load workflow"))
    return () => { active = false }
  }, [getToken, id])

  if (error) return <div className="p-6 text-sm text-destructive">{error}</div>
  if (!accessToken) return <div className="p-6 text-sm text-muted-foreground">Loading workflow…</div>
  return <Room roomId={id}><ReactFlowProvider><WorkflowRunsProvider workflowId={id} accessToken={accessToken}><WorkflowShell workflowId={id} /></WorkflowRunsProvider></ReactFlowProvider></Room>
}
