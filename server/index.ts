import express from "express"
import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express"
import { auth as triggerAuth, runs, tasks } from "@trigger.dev/sdk"
import { NotFoundError } from "@browserbasehq/sdk"
import { liveblocks } from "../lib/liveblocks"
import { browserbase } from "../lib/browserbase"
import { createWorkflow, deleteWorkflow, getWorkflow, listWorkflows, saveWorkflowGraph } from "../features/workflows/data"
import { validateGraph } from "../features/workflows/lib/validate-graph"
import type { runWorkflowTask } from "../features/workflows/tasks/run-workflow"

const app = express()
const port = Number(process.env.PORT ?? 3001)
app.use(express.json({ limit: "2mb" }))
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}))

function authFor(req: express.Request) {
  const auth = getAuth(req)
  if (!auth.userId || !auth.orgId) {
    const error = new Error("Unauthorized") as Error & { status: number }
    error.status = 401
    throw error
  }
  return auth
}

function route(handler: (req: express.Request, res: express.Response) => Promise<unknown>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    void handler(req, res).catch(next)
  }
}

function routeParam(req: express.Request, name: string): string {
  const value = req.params[name]
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

app.get("/api/workflows", route(async (req, res) => {
  const { orgId } = authFor(req)
  res.json(await listWorkflows(orgId!))
}))

app.post("/api/workflows", route(async (req, res) => {
  const { orgId } = authFor(req)
  const name = typeof req.body?.name === "string" ? req.body.name.trim().slice(0, 120) : ""
  if (!name) { res.status(400).send("A workflow name is required"); return }
  res.status(201).json(await createWorkflow(orgId!, name))
}))

app.delete("/api/workflows/:id", route(async (req, res) => {
  const { orgId } = authFor(req)
  const id = routeParam(req, "id")
  const deleted = await deleteWorkflow(orgId!, id)
  if (!deleted) { res.status(404).send("Workflow not found"); return }
  await liveblocks.deleteRoom(id)
  res.status(204).end()
}))

app.get("/api/workflows/:id/session", route(async (req, res) => {
  const { orgId } = authFor(req)
  const id = routeParam(req, "id")
  const workflow = await getWorkflow(orgId!, id)
  if (!workflow) { res.status(404).send("Workflow not found"); return }
  await liveblocks.getOrCreateRoom(id, {
    organizationId: orgId!, defaultAccesses: [],
    groupsAccesses: { [orgId!]: ["room:write"] },
    metadata: { title: workflow.name },
  })
  const runsToken = await triggerAuth.createPublicToken({ scopes: { read: { tags: [`workflow:${id}`] } }, expirationTime: "1hr" })
  res.json({ runsToken })
}))

app.post("/api/workflows/:id/run", route(async (req, res) => {
  const auth = authFor(req)
  const id = routeParam(req, "id")
  const graph = req.body?.graph
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) { res.status(400).send("Invalid workflow graph"); return }
  const problems = validateGraph(graph)
  if (problems.length) { res.status(400).send(problems.join(" ")); return }
  const workflow = await getWorkflow(auth.orgId!, id)
  if (!workflow) { res.status(404).send("Workflow not found"); return }
  await saveWorkflowGraph({ orgId: auth.orgId!, id, graph })
  const handle = await tasks.trigger<typeof runWorkflowTask>("run-workflow", { workflowId: id, orgId: auth.orgId! }, { tags: [`workflow:${id}`] })
  res.status(202).json({ id: handle.id })
}))

app.delete("/api/runs/:runId", route(async (req, res) => {
  authFor(req)
  await runs.cancel(routeParam(req, "runId"))
  res.status(204).end()
}))

app.post("/api/liveblocks/auth", route(async (req, res) => {
  const { userId, orgId } = authFor(req)
  const user = await clerkClient.users.getUser(userId!)
  const result = await liveblocks.identifyUser({ userId: userId!, groupIds: [orgId!], organizationId: orgId! }, { userInfo: { name: user.fullName ?? user.username ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous", avatar: user.imageUrl } })
  res.status(result.status).send(result.body)
}))

app.post("/api/liveblocks/users", route(async (req, res) => {
  const { orgId } = authFor(req)
  const userIds: unknown = req.body?.userIds
  if (!Array.isArray(userIds) || userIds.some((id) => typeof id !== "string")) { res.status(400).send("Expected { userIds: string[] }"); return }
  if (!userIds.length) { res.json([]); return }
  const { data } = await clerkClient.users.getUserList({ userId: userIds as string[], organizationId: [orgId!], limit: userIds.length })
  const map = new Map(data.map((user) => [user.id, user]))
  res.json((userIds as string[]).map((id) => {
    const user = map.get(id)
    return user ? { name: user.fullName ?? user.username ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous", avatar: user.imageUrl } : null
  }))
}))

app.get("/api/replays/:sessionId", route(async (req, res) => {
  const auth = authFor(req)
  const sessionId = routeParam(req, "sessionId")
  try {
    const replay = await browserbase.sessions.replays.retrieve(sessionId)
    const firstPage = replay.pages[0]
    if (!firstPage) { res.status(202).end(); return }
    const playlist = await browserbase.sessions.replays.retrievePage(sessionId, firstPage.pageId)
    res.set({ "Content-Type": "application/vnd.apple.mpegurl", "Cache-Control": "no-store" }).send(await playlist.text())
  } catch (error) {
    if (error instanceof NotFoundError) { res.status(202).end(); return }
    throw error
  }
}))

app.use((error: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(error.status ?? 500).send(error.status ? error.message : "Internal server error")
})

if (process.env.NODE_ENV === "production") {
  const { resolve } = await import("node:path")
  app.use(express.static(resolve("dist")))
  app.get("/{*path}", (_req, res) => res.sendFile(resolve("dist/index.html")))
}

app.listen(port, () => console.log(`API server listening on http://localhost:${port}`))
