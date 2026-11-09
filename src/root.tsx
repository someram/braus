import { Navigate, Outlet, Route, Routes, Link } from "react-router-dom"
import type { ReactNode } from "react"
import { SignIn, SignUp, TaskChooseOrganization, useAuth } from "@clerk/react"
import { ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Dashboard } from "./views/dashboard"
import { LandingPage } from "./views/landing-page"
import { WorkflowPage } from "./views/workflow-page"
import { HomePage } from "./views/home-page"
import "./views/auth-page.css"

const authAppearance = {
  variables: {
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorBackground: "var(--background)",
    colorForeground: "var(--foreground)",
    colorMutedForeground: "var(--muted-foreground)",
    colorMuted: "var(--muted)",
    colorInput: "var(--background)",
    colorInputForeground: "var(--foreground)",
    colorBorder: "var(--border)",
    colorRing: "var(--ring)",
    colorNeutral: "var(--foreground)",
    fontFamily: 'Arial, "Helvetica Neue", sans-serif',
    fontFamilyButtons: 'Arial, "Helvetica Neue", sans-serif',
    borderRadius: "0.3rem",
  },
  elements: {
    rootBox: "auth-clerk-root",
    cardBox: "auth-clerk-card-box",
    card: "auth-clerk-card",
    headerTitle: "auth-clerk-title",
    headerSubtitle: "auth-clerk-subtitle",
    formButtonPrimary: "auth-clerk-primary",
    formFieldInput: "auth-clerk-input",
    socialButtonsBlockButton: "auth-clerk-social",
    footerActionLink: "auth-clerk-link",
  },
}

function AuthPage({ children }: { children: ReactNode }) {
  return (
    <main className="auth-screen">
      <Link className="auth-brand" to="/" aria-label="Back to Braus home">
        <span className="auth-brand-mark"><span /></span>
        <span>braus<span className="auth-brand-period">.</span></span>
      </Link>
      <Link className="auth-home-link" to="/"><ArrowLeft size={14} aria-hidden="true" /> Back to home</Link>
      <ThemeToggle className="auth-theme-toggle" />
      <div className="auth-card-wrap">{children}</div>
      <div className="auth-caption">BROWSER AUTOMATION, RECONSIDERED</div>
    </main>
  )
}

function OrganizationGate() {
  const { isLoaded, orgId } = useAuth()
  if (!isLoaded) return null
  if (!orgId) return <Navigate to="/choose-organization" replace />
  return <Outlet />
}

function AuthenticationGate() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return null
  return isSignedIn ? <Outlet /> : <Navigate to="/sign-in" replace />
}

export function App() {
  return (
    <Routes>
      <Route path="/sign-in/*" element={<AuthPage><SignIn routing="path" path="/sign-in" appearance={authAppearance} /></AuthPage>} />
      <Route path="/sign-up/*" element={<AuthPage><SignUp routing="path" path="/sign-up" appearance={authAppearance} /></AuthPage>} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/choose-organization" element={<div className="relative flex min-h-svh items-center justify-center bg-background text-foreground"><ThemeToggle className="absolute top-5 right-5 z-10" /><TaskChooseOrganization redirectUrlComplete="/dashboard" /></div>} />
      <Route element={<AuthenticationGate />}>
        <Route element={<OrganizationGate />}>
          <Route path="dashboard" element={<Dashboard />}>
            <Route index element={<HomePage />} />
            <Route path="workflows/:id" element={<WorkflowPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
