"use client"

import { useEffect, useState, useTransition } from "react"
import { useAuth } from "@clerk/react"
import { useNavigate } from "react-router-dom"
import { useReactFlow, useStore } from "@xyflow/react"
import { MoreHorizontal, Play, Square, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResizablePanel } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { apiFetch } from "@/src/lib/api"
import { useLiveRun } from "@/features/workflows/components/workflow-runs-provider"
import { validateGraph } from "@/features/workflows/lib/validate-graph"
import {
  nodeRegistry,
  type NodeDefinition,
  type NodeField,
  type NodeType,
  type StepNodeKind,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"

function NodeIcon({ type, className }: { type: NodeType; className?: string }) {
  const def = nodeRegistry[type]
  const Icon = def.icon
  return (
    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md", def.accent, className)}>
      <Icon className="size-3.5" />
    </span>
  )
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-y border-border bg-card px-3 py-1.5 text-sm font-semibold">
        {icon}{title}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

function FieldInput({ field, value, onChange }: { field: NodeField; value: string; onChange: (value: string) => void }) {
  const props = {
    id: field.key,
    value,
    placeholder: field.placeholder,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
  }
  return field.multiline ? <Textarea {...props} /> : <Input {...props} />
}

function Inspector({ node }: { node: StepNodeType | undefined }) {
  const { updateNodeData } = useReactFlow<StepNodeType>()
  if (!node) return <Section title="Editor"><p className="p-3 text-sm text-muted-foreground">No node selected</p></Section>

  const { type, title, values } = node.data
  const def: NodeDefinition = nodeRegistry[type]
  return (
    <Section title={title} icon={<NodeIcon type={type} />}>
      <div className="flex flex-col gap-3 p-3">
        {def.fields.length === 0 ? <p className="text-xs text-muted-foreground">No properties</p> : def.fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <Label htmlFor={field.key} className="text-xs">{field.label}{field.required && <span className="text-destructive">*</span>}</Label>
            <FieldInput field={field} value={values[field.key] ?? ""} onChange={(value) => updateNodeData(node.id, { values: { ...values, [field.key]: value } })} />
          </div>
        ))}
      </div>
    </Section>
  )
}

const sections: { kind: StepNodeKind; label: string }[] = [
  { kind: "trigger", label: "Triggers" },
  { kind: "action", label: "Actions" },
]
const definitions = Object.values(nodeRegistry)

function Palette() {
  const { getNodes, getViewport, addNodes } = useReactFlow<StepNodeType>()
  const width = useStore((s) => s.width)
  const height = useStore((s) => s.height)

  const add = (type: NodeType) => {
    const def = nodeRegistry[type]
    const nodes = getNodes()
    if (def.kind === "trigger" && nodes.some((node) => node.data.kind === "trigger")) {
      toast.error("A workflow can only have one trigger.")
      return
    }
    const count = nodes.filter((node) => node.data.type === type).length
    const { x, y, zoom } = getViewport()
    addNodes({
      id: crypto.randomUUID(),
      type: "step",
      position: { x: (width / 2 - x) / zoom, y: (height / 2 - y) / zoom },
      data: { type, kind: def.kind, title: `${def.label} ${count + 1}`, values: {} },
    })
  }

  return (
    <Section title="Toolbar">
      <Accordion type="multiple" defaultValue={sections.map((section) => section.kind)} className="px-3 py-2">
        {sections.map((section) => (
          <AccordionItem key={section.kind} value={section.kind} className="not-last:border-b-0">
            <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:no-underline">{section.label}</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-0.5">
              {definitions.filter((def) => def.kind === section.kind).map((def) => {
                const type = def.type as NodeType
                return <Button key={def.type} variant="ghost" onClick={() => add(type)} className="justify-start gap-2.5 px-1.5 text-xs"><NodeIcon type={type} />{def.label}</Button>
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  )
}

function ActionsMenu({ workflowId }: { workflowId: string }) {
  const [isPending, startTransition] = useTransition()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuItem variant="destructive" disabled={isPending} className="text-xs [&_svg:not([class*='size-'])]:size-3.5" onSelect={(event) => {
          event.preventDefault()
          startTransition(async () => {
            try {
              const token = await getToken()
              await apiFetch(token, `/api/workflows/${workflowId}`, { method: "DELETE" })
              navigate("/")
            } catch {
              toast.error("Couldn't delete the workflow.")
            }
          })
        }}><Trash2 />Delete workflow</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RunButton({ workflowId }: { workflowId: string }) {
  const { getNodes, getEdges } = useReactFlow<StepNodeType>()
  const [isPending, startTransition] = useTransition()
  const liveRun = useLiveRun()
  const { getToken } = useAuth()

  const run = (method: "POST" | "DELETE", path: string, body?: string) => startTransition(async () => {
    try {
      const token = await getToken()
      await apiFetch(token, path, { method, ...(body ? { body } : {}) })
    } catch {
      toast.error(method === "DELETE" ? "Couldn't stop the run." : "Couldn't start the workflow.")
    }
  })

  if (liveRun) return <Button size="sm" variant="destructive" disabled={isPending} onClick={() => run("DELETE", `/api/runs/${liveRun.id}`)}><Square fill="currentColor" />Stop</Button>

  return <Button size="sm" variant="secondary" disabled={isPending} onClick={() => {
    const graph = { nodes: getNodes(), edges: getEdges() }
    const problems = validateGraph(graph)
    if (problems.length) { toast.error(problems[0]); return }
    run("POST", `/api/workflows/${workflowId}/run`, JSON.stringify({ graph }))
  }}><Play fill="primary" />Run</Button>
}

export function RightSidebar({ workflowId }: { workflowId: string }) {
  const [tab, setTab] = useState("toolbar")
  const selected = useStore((s) => s.nodes.find((node) => node.selected)) as StepNodeType | undefined

  useEffect(() => {
    if (selected) setTab("editor")
  }, [selected?.id])

  return (
    <ResizablePanel className="bg-background" defaultSize="16rem" minSize="14rem" maxSize="36rem" groupResizeBehavior="preserve-pixel-size">
      <Tabs value={tab} onValueChange={setTab} className="size-full gap-0">
        <div className="flex items-center justify-between border-b border-border p-2"><ActionsMenu workflowId={workflowId} /><RunButton workflowId={workflowId} /></div>
        <TabsList className="m-2 w-fit bg-background">
          <TabsTrigger value="toolbar" className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!">Toolbar</TabsTrigger>
          <TabsTrigger value="editor" className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!">Editor</TabsTrigger>
        </TabsList>
        <TabsContent value="toolbar" className="flex min-h-0 flex-col"><Palette /></TabsContent>
        <TabsContent value="editor" className="flex min-h-0 flex-col"><Inspector key={selected?.id} node={selected} /></TabsContent>
      </Tabs>
    </ResizablePanel>
  )
}
