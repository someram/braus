import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@clerk/react"
import {
  ArrowDownRight,
  ArrowRight,
  Bot,
  Braces,
  ChevronRight,
  Command,
  Eye,
  Globe,
  Mail,
  MousePointer2,
  Play,
  Sparkles,
  Terminal,
  Workflow,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import "./landing-page.css"

const capabilities = [
  {
    number: "01",
    icon: MousePointer2,
    title: "Act",
    description: "Click, type, and move through a site with one clear instruction.",
    detail: "Natural language in. Browser actions out.",
  },
  {
    number: "02",
    icon: Braces,
    title: "Extract",
    description: "Turn what a page knows into structured, typed data you can use.",
    detail: "Grounded in the page, shaped by your schema.",
  },
  {
    number: "03",
    icon: Eye,
    title: "Observe",
    description: "See the actions available before your automation commits to one.",
    detail: "A useful pause between intent and action.",
  },
  {
    number: "04",
    icon: Workflow,
    title: "Orchestrate",
    description: "Build repeatable browser workflows and follow every run as it happens.",
    detail: "Reliable steps, visible from start to finish.",
  },
]

export function LandingPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate("/dashboard", { replace: true })
  }, [isLoaded, isSignedIn, navigate])

  if (!isLoaded || isSignedIn) return null

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="brand-lockup" aria-label="Braus home">
            <span className="brand-mark"><span /></span>
            <span>braus<span className="brand-period">.</span></span>
          </Link>
          <nav className="landing-links" aria-label="Main navigation">
            <a href="#capabilities">Platform</a>
            <a href="#method">How it works</a>
          </nav>
          <div className="landing-actions">
            <ThemeToggle className="landing-theme-toggle" />
            <Link className="nav-signin" to="/sign-in">Sign in</Link>
            <Link className="nav-cta" to="/sign-up">Get started <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-rule" /> BROWSER AUTOMATION, RECONSIDERED</div>
          <h1>Give the web<br />a <em>little direction.</em></h1>
          <p className="hero-description">Braus gives your code a way to work with the web as it is. Describe the outcome. Watch the browser take it from there.</p>
          <div className="hero-actions">
            <Link to="/sign-up" className="button-primary">Start building <ArrowRight size={16} aria-hidden="true" /></Link>
            <a href="#method" className="button-text">See how it works <ChevronRight size={15} aria-hidden="true" /></a>
          </div>
          <div className="hero-footnote"><span className="status-dot" /> Built on Stagehand <span className="footnote-divider">·</span> Made for developers</div>
        </div>

        <div className="hero-art" aria-label="Workflow running: Start, Open URL, Agent, Send Email" role="img">
          <div className="workflow-canvas">
            <div className="workflow-track" aria-hidden="true">
              <span className="workflow-link workflow-link-one" />
              <span className="workflow-link workflow-link-two" />
              <span className="workflow-link workflow-link-three" />
            </div>
            <div className="workflow-node workflow-node-one"><span className="workflow-icon workflow-icon-start"><Play size={15} fill="currentColor" aria-hidden="true" /></span><span className="workflow-title">Start</span></div>
            <div className="workflow-node workflow-node-two"><span className="workflow-icon workflow-icon-url"><Globe size={16} aria-hidden="true" /></span><span className="workflow-title">Open URL</span></div>
            <div className="workflow-node workflow-node-three"><span className="workflow-icon workflow-icon-agent"><Bot size={16} aria-hidden="true" /></span><span className="workflow-title">Agent</span></div>
            <div className="workflow-node workflow-node-four"><span className="workflow-icon workflow-icon-email"><Mail size={16} aria-hidden="true" /></span><span className="workflow-title">Send Email</span></div>
          </div>
        </div>
        <a href="#capabilities" className="scroll-cue"><span>SCROLL TO EXPLORE</span><ArrowDownRight size={14} aria-hidden="true" /></a>
      </section>

      <section className="manifesto" id="method">
        <div className="section-kicker"><span>01</span><span className="kicker-rule" /> THE IDEA</div>
        <div className="manifesto-content">
          <h2>The web wasn&apos;t built<br />for your <em>selectors.</em></h2>
          <div className="manifesto-aside"><p>Pages change. Layouts shift. The work should still get done. Braus brings a more human interface to browser automation—one that starts with what you mean.</p><a href="#capabilities">Meet the primitives <ArrowRight size={15} aria-hidden="true" /></a></div>
        </div>
        <div className="manifesto-bottom"><span>INTENT, MEET INTERFACE</span><span>01 / 03</span></div>
      </section>

      <section className="capabilities" id="capabilities">
        <div className="capabilities-heading"><div><div className="section-kicker"><span>02</span><span className="kicker-rule" /> THE TOOLKIT</div><h2>Four ways to<br /><em>get somewhere.</em></h2></div><p>Small, composable primitives for building browser automation that makes sense to people and machines.</p></div>
        <div className="capability-grid">
          {capabilities.map(({ number, icon: Icon, title, description, detail }) => (
            <article className="capability" key={number}>
              <div className="capability-top"><span>{number}</span><Icon size={20} strokeWidth={1.5} aria-hidden="true" /></div>
              <h3>{title}</h3><p>{description}</p><div className="capability-detail"><span />{detail}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="method-strip">
        <div className="section-kicker"><span>03</span><span className="kicker-rule" /> THE METHOD</div>
        <div className="method-layout"><h2>Less plumbing.<br /><em>More progress.</em></h2><div className="method-steps">
          <div className="method-step"><span>01</span><div><h3>Say what you mean</h3><p>Write an instruction in plain language, right where you already work.</p></div><Command size={17} aria-hidden="true" /></div>
          <div className="method-step"><span>02</span><div><h3>Let the browser respond</h3><p>Stagehand works with the live page, interpreting intent as it goes.</p></div><Play size={17} aria-hidden="true" /></div>
          <div className="method-step"><span>03</span><div><h3>Keep the useful part</h3><p>Get structured results and a clear record of what happened.</p></div><Terminal size={17} aria-hidden="true" /></div>
        </div></div>
      </section>

      <section className="closing-cta">
        <div className="cta-overline"><Sparkles size={14} aria-hidden="true" /> YOUR NEXT WORKFLOW STARTS HERE</div>
        <div className="cta-main"><h2>Make the browser<br /><em>part of the team.</em></h2><Link to="/sign-up" className="button-primary button-primary-light">Get started with Braus <ArrowRight size={16} aria-hidden="true" /></Link></div>
        <div className="cta-footer"><span>No selector maintenance.</span><span>Just a better way to work with the web.</span></div>
      </section>

      <footer className="landing-footer"><Link to="/" className="brand-lockup"><span className="brand-mark"><span /></span><span>braus<span className="brand-period">.</span></span></Link><span>Browser automation with a human touch.</span><span>© 2025 BRAUS</span></footer>
    </main>
  )
}
