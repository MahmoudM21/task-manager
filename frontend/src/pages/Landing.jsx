import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckSquare, FolderOpen, CheckCircle2, Zap, ArrowRight,
  Star, Circle, Clock, Sparkles, Shield, Users,
} from 'lucide-react';

/* ─── tiny reusable components ─────────────────────────────────── */

const NavLink = ({ onClick, href, children }) =>
  href ? (
    <Link to={href} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
      {children}
    </button>
  );

/* ─── Dashboard SVG Mockup ──────────────────────────────────────── */
const DashboardMockup = () => (
  <div className="relative bg-white rounded-2xl shadow-card-lg border border-gray-100 overflow-hidden animate-fade-in">
    {/* Window chrome */}
    <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-gray-50">
      <span className="w-3 h-3 rounded-full bg-red-400" />
      <span className="w-3 h-3 rounded-full bg-yellow-400" />
      <span className="w-3 h-3 rounded-full bg-green-400" />
      <div className="ml-3 flex-1 h-5 bg-white rounded border border-gray-200 flex items-center px-2">
        <span className="text-[9px] text-gray-400 font-mono">taskflow.app/dashboard</span>
      </div>
    </div>

    <div className="p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-indigo-600 rounded-md flex items-center justify-center">
            <CheckSquare className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold text-indigo-700">TaskFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-indigo-100 rounded-full" />
          <span className="text-[10px] text-gray-500 font-medium">Sarah K.</span>
        </div>
      </div>

      {/* Page title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-800">My Projects</span>
        <div className="h-5 w-20 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-[8px] text-white font-semibold">+ New Project</span>
        </div>
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { name: 'Website Redesign', todo: 3, prog: 2, done: 5, pct: 62 },
          { name: 'Mobile App v2',    todo: 6, prog: 1, done: 3, pct: 30 },
        ].map((p) => (
          <div key={p.name} className="bg-white border border-gray-100 rounded-xl p-3 shadow-card">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FolderOpen className="w-3 h-3 text-indigo-600" />
              </div>
              <span className="text-[10px] font-bold text-gray-800 truncate">{p.name}</span>
            </div>
            <div className="flex gap-1.5 mb-2">
              <span className="badge status-todo text-[8px] px-1.5 py-0.5">{p.todo} Todo</span>
              <span className="badge status-in-progress text-[8px] px-1.5 py-0.5">{p.prog} Active</span>
              <span className="badge status-done text-[8px] px-1.5 py-0.5">{p.done} Done</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full">
              <div className="h-1 bg-indigo-500 rounded-full" style={{ width: `${p.pct}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[8px] text-gray-400">{p.todo + p.prog + p.done} tasks</span>
              <span className="text-[8px] font-bold text-indigo-600">{p.pct}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI panel */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3 h-3 text-indigo-600" />
          <span className="text-[10px] font-bold text-indigo-800">AI Insights</span>
          <span className="ml-auto text-[8px] text-indigo-400">10 tasks analyzed</span>
        </div>
        <div className="space-y-1">
          {[100, 85, 65].map((w, i) => (
            <div key={i} className="h-1.5 bg-indigo-200/60 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>

    {/* Floating notification */}
    <div className="absolute -top-3 -right-3 bg-white rounded-xl shadow-card-md border border-gray-100 px-3 py-2 flex items-center gap-2">
      <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      </div>
      <div>
        <p className="text-[9px] font-bold text-gray-800">Task completed!</p>
        <p className="text-[8px] text-gray-400">Just now</p>
      </div>
    </div>

    {/* Floating progress badge */}
    <div className="absolute -bottom-3 -left-3 bg-white rounded-xl shadow-card-md border border-gray-100 px-3 py-2">
      <p className="text-[9px] font-bold text-gray-800 mb-1">Sprint Progress</p>
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 bg-gray-100 rounded-full">
          <div className="w-[68%] h-1.5 bg-indigo-500 rounded-full" />
        </div>
        <span className="text-[9px] font-extrabold text-indigo-600">68%</span>
      </div>
    </div>
  </div>
);

/* ─── Feature Card ──────────────────────────────────────────────── */
const FeatureCard = ({ Icon, title, description, iconBg, iconColor, delay }) => (
  <div
    className="card card-hover p-8 cursor-default animate-slide-up"
    style={{ animationDelay: delay }}
  >
    <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mb-5`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
  </div>
);

/* ─── Step ──────────────────────────────────────────────────────── */
const Step = ({ num, title, description, color }) => (
  <div className="flex flex-col items-center text-center relative z-10">
    <div className={`w-16 h-16 ${color} text-white rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-card-md mb-5`}>
      {num}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed max-w-56">{description}</p>
  </div>
);

/* ─── Hero Skeleton ─────────────────────────────────────────────── */
const HeroSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      <div className="space-y-5 animate-pulse">
        <div className="h-5 w-36 bg-indigo-100 rounded-full" />
        <div className="space-y-3">
          <div className="h-12 bg-gray-100 rounded-2xl w-full" />
          <div className="h-12 bg-gray-100 rounded-2xl w-4/5" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded-lg w-full" />
          <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-40 bg-indigo-100 rounded-xl" />
          <div className="h-12 w-40 bg-gray-100 rounded-xl" />
        </div>
      </div>
      <div className="hidden lg:block h-80 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  </div>
);

/* ─── Main Component ────────────────────────────────────────────── */
export default function Landing() {
  const navigate     = useNavigate();
  const featuresRef  = useRef(null);
  const [mounted,    setMounted]    = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/dashboard', { replace: true });
  }, [navigate]);

  useEffect(() => { setMounted(true); }, []);

  const scrollToFeatures = () =>
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <CheckSquare className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-extrabold text-gray-900">TaskFlow</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink onClick={scrollToFeatures}>Features</NavLink>
            <NavLink onClick={scrollToFeatures}>How It Works</NavLink>
            <NavLink href="/login">Login</NavLink>
            <Link
              to="/register"
              className="btn-primary text-sm"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-600">Login</Link>
            <Link to="/register" className="btn-primary text-xs px-4 py-2">Sign Up</Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-white pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Decorative elements */}
        <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -top-10 -right-20 w-64 h-64 bg-violet-100/50 rounded-full blur-2xl pointer-events-none" />

        {!mounted ? <HeroSkeleton /> : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <div className="animate-slide-up">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6">
                <Zap className="w-3.5 h-3.5" />
                Powered by Claude AI
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-6">
                Manage Projects,{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Achieve Goals
                </span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-md">
                TaskFlow brings your team's work into focus — visual Kanban boards,
                real-time progress, and AI insights that tell you exactly what to do next.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  to="/register"
                  className="btn-primary text-base px-7 py-3.5 shadow-md hover:shadow-indigo-200"
                >
                  Start For Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={scrollToFeatures}
                  className="btn-secondary text-base px-7 py-3.5"
                >
                  See How It Works
                </button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['bg-indigo-400','bg-violet-400','bg-pink-400','bg-sky-400','bg-emerald-400'].map((c, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center`}>
                      <span className="text-[9px] font-bold text-white">{String.fromCharCode(65 + i)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Loved by 5,000+ teams worldwide</p>
                </div>
              </div>
            </div>

            {/* Right: mockup */}
            <div className="relative hidden lg:block px-6 py-6">
              <DashboardMockup />
            </div>
          </div>
        </div>
        )}
      </section>

      {/* ── Trust strip ─────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Why teams choose TaskFlow
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {[
              { icon: Shield,   text: 'Secure by default'    },
              { icon: Zap,      text: 'AI-powered insights'  },
              { icon: Users,    text: 'Built for teams'      },
              { icon: CheckCircle2, text: 'Zero setup time'  },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Icon className="w-4 h-4 text-indigo-500" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section ref={featuresRef} id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Everything your team needs
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              A complete workspace — from first idea to shipped project.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              Icon={FolderOpen}
              title="Smart Projects"
              description="Organize work into clear projects. See live task counts, completion progress, and project health at a glance — without opening a single task."
              iconBg="bg-indigo-100"
              iconColor="text-indigo-600"
              delay="0ms"
            />
            <FeatureCard
              Icon={CheckCircle2}
              title="Kanban Task Tracking"
              description="Intuitive three-column boards: To Do, In Progress, Done. Move tasks in one click. Filter by status. Stay focused on what matters most."
              iconBg="bg-violet-100"
              iconColor="text-violet-600"
              delay="60ms"
            />
            <FeatureCard
              Icon={Sparkles}
              title="AI Project Insights"
              description="Claude AI analyzes your tasks and returns a concise summary: project health, blockers, your next three best actions, and a completion estimate."
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
              delay="120ms"
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-indigo-50/40 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Up and running in minutes
            </h2>
            <p className="text-gray-500 text-lg">Three steps. Zero learning curve.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector lines */}
            <div aria-hidden className="hidden md:block absolute top-8 left-[calc(16.7%+2rem)] right-[calc(16.7%+2rem)] h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-purple-200" />

            <Step
              num="01"
              title="Create a Project"
              description="Give it a name and description. Invite teammates or keep it personal."
              color="bg-indigo-600"
            />
            <Step
              num="02"
              title="Add Your Tasks"
              description="Break work into tasks. Set status, add descriptions, and assign priorities."
              color="bg-violet-600"
            />
            <Step
              num="03"
              title="Get AI Insights"
              description="Click AI Insights — Claude analyzes your board and tells you what to tackle next."
              color="bg-purple-600"
            />
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '5,000+', label: 'Teams using TaskFlow' },
              { value: '120k+',  label: 'Tasks completed'      },
              { value: '99.9%',  label: 'Uptime SLA'           },
              { value: '<1min',  label: 'Avg. AI response'     },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-extrabold text-indigo-600 mb-1">{value}</p>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,_#818cf8/20%,_transparent_70%)] pointer-events-none" />
        <div aria-hidden className="absolute -bottom-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            Free forever for individuals
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Ready to get organized?
          </h2>
          <p className="text-indigo-200 text-lg mb-10 leading-relaxed">
            Join thousands of teams managing their projects smarter.
            No credit card. No setup. Just results.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2.5 bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-indigo-300 text-xs mt-4 font-medium">
            No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-extrabold text-white">TaskFlow</span>
            </div>
            <p className="text-sm text-gray-500">Your projects, beautifully organized.</p>
            <p className="text-sm text-gray-600">
              Built with <span className="text-red-400">♥</span> for productive teams
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
