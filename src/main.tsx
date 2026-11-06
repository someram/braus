import React from "react"
import ReactDOM from "react-dom/client"
import { ClerkProvider } from "@clerk/react"
import { BrowserRouter } from "react-router-dom"
import { shadcn } from "@clerk/ui/themes"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import * as Sentry from "@sentry/react"
import { App } from "./root"
import "@clerk/ui/themes/shadcn.css"
import "@/app/globals.css"

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN ?? import.meta.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: import.meta.env.DEV ? 1 : 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
})

if (!publishableKey) {
  throw new Error("VITE_CLERK_PUBLISHABLE_KEY is not set")
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl={import.meta.env.VITE_CLERK_SIGN_IN_URL ?? "/sign-in"}
      signUpUrl={import.meta.env.VITE_CLERK_SIGN_UP_URL ?? "/sign-up"}
      taskUrls={{ "choose-organization": "/choose-organization" }}
      appearance={{ theme: shadcn }}
    >
      <BrowserRouter>
        <ThemeProvider>
          <TooltipProvider>
            <Sentry.ErrorBoundary fallback={<main className="p-8 text-sm text-destructive">The application hit an unexpected error. Reload the page to try again.</main>}>
              <App />
            </Sentry.ErrorBoundary>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
)
