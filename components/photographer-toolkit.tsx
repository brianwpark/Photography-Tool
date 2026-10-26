'use client'

import { useMemo, useState } from 'react'
import {
  Aperture,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Camera,
  ChevronDown,
  Clock3,
  Crosshair,
  Gauge,
  Layers3,
  Menu,
  Mountain,
  Ruler,
  Search,
  Settings2,
  SunMedium,
  X,
} from 'lucide-react'

const tools = [
  { name: 'Exposure', detail: 'Balance the triangle', icon: Gauge, active: true },
  { name: 'Depth of field', detail: 'Focus with intention', icon: Aperture },
  { name: 'Light planner', detail: 'Follow the sun', icon: SunMedium },
  { name: 'Shot planner', detail: 'Build your sequence', icon: BookOpen },
  { name: 'Field utilities', detail: 'Fast on-location math', icon: Settings2 },
]

export function PhotographerToolkit() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [iso, setIso] = useState('400')
  const [aperture, setAperture] = useState('f/4')
  const [shutter, setShutter] = useState('1/250')
  const [activeTool, setActiveTool] = useState('Exposure')

  const toolCopy: Record<string, { eyebrow: string; title: string; description: string; action: string }> = {
    Exposure: { eyebrow: '01 / Exposure calculator', title: 'Find your starting point.', description: 'Adjust any value to explore equivalent exposures.', action: 'Open full calculator' },
    'Depth of field': { eyebrow: '02 / Depth of field', title: 'Make focus intentional.', description: 'Calculate the near and far limits of sharpness for your lens and subject.', action: 'Open depth calculator' },
    'Light planner': { eyebrow: '03 / Light planner', title: 'Follow the light.', description: 'Plan around sunrise, golden hour, and the direction of the sun at your location.', action: 'Open sun planner' },
    'Shot planner': { eyebrow: '04 / Shot planner', title: 'Build the sequence.', description: 'Shape a visual story with a simple shot list you can take into the field.', action: 'Open shot planner' },
    'Field utilities': { eyebrow: '05 / Field utilities', title: 'Keep the math moving.', description: 'Reach for quick conversions, reciprocity timing, and angle-of-view references.', action: 'Open utility shelf' },
    'Hyperfocal distance': { eyebrow: 'Utility / Hyperfocal distance', title: 'Keep everything sharp.', description: 'Set the focus distance that gives you the widest usable depth of field.', action: 'Adjust hyperfocal distance' },
    'Reciprocity timer': { eyebrow: 'Utility / Reciprocity timer', title: 'Time the long exposure.', description: 'Use a compensated exposure timer when your film or sensor needs extra time.', action: 'Start timer' },
    'Angle of view': { eyebrow: 'Utility / Angle of view', title: 'Know what the lens sees.', description: 'Compare the framing angle for your current focal length and sensor.', action: 'Adjust lens profile' },
  }
  const selectedCopy = toolCopy[activeTool] ?? toolCopy.Exposure

  const stops = useMemo(() => {
    const isoStops = Math.log2(Number(iso) / 100)
    const apertureStops = aperture === 'f/2.8' ? 3 : aperture === 'f/5.6' ? 5 : 4
    const shutterStops = shutter === '1/125' ? 7 : shutter === '1/500' ? 9 : 8
    return (isoStops + apertureStops + shutterStops - 16).toFixed(1)
  }, [iso, aperture, shutter])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-10">
            <a href="#top" className="flex items-center gap-3" aria-label="Fieldcraft home">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Crosshair className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.28em]">Fieldcraft</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">for photographers</div>
              </div>
            </a>
            <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
              <a className="text-sm font-medium text-foreground" href="#tools">Toolkit</a>
              <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="#planner">Planner</a>
              <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="#learn">Field notes</a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground sm:flex"><Search className="h-3.5 w-3.5" /> Search tools <span className="font-mono text-[10px]">⌘K</span></button>
            <button aria-label="Open menu" onClick={() => setMobileOpen(!mobileOpen)} className="rounded-full border border-border p-2.5 md:hidden">{mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
            <button className="hidden rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground sm:block">Save a setup</button>
          </div>
        </div>
        {mobileOpen && <nav className="flex flex-col gap-4 border-t border-border px-5 py-5 md:hidden"><a href="#tools">Toolkit</a><a href="#planner">Planner</a><a href="#learn">Field notes</a></nav>}
      </header>

      <main id="top" className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8">
        <section className="grid gap-10 pb-12 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:pt-20">
          <div>
            <p className="mb-5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Your field companion / 01</p>
            <h1 className="max-w-2xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-7xl">Make the moment<br /><span className="text-muted-foreground">count.</span></h1>
          </div>
          <div className="flex max-w-md flex-col gap-5 lg:justify-self-end">
            <p className="text-pretty text-base leading-7 text-muted-foreground">Practical tools for the decisions between seeing the shot and making it. Calibrate your camera, read the light, and keep moving.</p>
            <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"><span>Local time <b className="text-foreground">14:32</b></span><span className="h-3 w-px bg-border" /><span>Lisbon, PT</span></div>
          </div>
        </section>

        <section id="tools" className="grid gap-4 lg:grid-cols-[250px_1fr]">
          <aside className="flex flex-col gap-2">
            <div className="mb-3 flex items-center justify-between px-1"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Your toolkit</p><span className="font-mono text-[10px] text-muted-foreground">05 tools</span></div>
            {tools.map((tool) => { const Icon = tool.icon; const active = activeTool === tool.name; return <button key={tool.name} aria-pressed={active} onClick={() => setActiveTool(tool.name)} className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${active ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/10' : 'border-transparent hover:border-border hover:bg-card'}`}><Icon className={`h-4 w-4 ${active ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'}`} strokeWidth={1.7} /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{tool.name}</span><span className={`block truncate text-[11px] ${active ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{tool.detail}</span></span>{active && <ArrowUpRight className="h-4 w-4" />}</button> })}
            <button aria-pressed={activeTool === 'Hyperfocal distance'} onClick={() => setActiveTool('Hyperfocal distance')} className={`group mt-2 hidden items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all lg:flex ${activeTool === 'Hyperfocal distance' ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/10' : 'border-transparent hover:border-border hover:bg-card'}`}><Ruler className={`h-4 w-4 ${activeTool === 'Hyperfocal distance' ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'}`} strokeWidth={1.7} /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">Hyperfocal distance</span><span className={`block truncate font-mono text-[11px] ${activeTool === 'Hyperfocal distance' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>∞ 2.84 m</span></span><ArrowUpRight className="h-4 w-4" /></button>
          </aside>

          <div className="min-w-0 rounded-2xl bg-card p-5 sm:p-8">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"><span className="text-accent">{selectedCopy.eyebrow.split(' / ')[0]}</span> / {selectedCopy.eyebrow.split(' / ')[1]}</div><h2 className="text-2xl font-semibold tracking-[-0.03em]">{selectedCopy.title}</h2></div><button className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"><Settings2 className="h-3.5 w-3.5" /> Camera profile <ChevronDown className="h-3 w-3" /></button></div>
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-xl bg-primary p-5 text-primary-foreground sm:p-7">
                <div className="mb-10 flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground/55">Current exposure</p><p className="mt-2 text-4xl font-semibold tracking-[-0.05em]">EV {stops}</p></div><div className="rounded-lg bg-primary-foreground/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-accent">Balanced</div></div>
                <div className="mb-5 h-12 border-y border-primary-foreground/15"><div className="relative h-full"><div className="absolute left-[18%] top-0 h-full w-px bg-accent" /><div className="absolute left-[18%] top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_5px_rgba(238,176,94,0.15)]" /><div className="flex h-full items-center justify-between px-1 font-mono text-[9px] text-primary-foreground/40"><span>-2</span><span>-1</span><span>0</span><span>+1</span><span>+2</span></div></div></div>
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-primary-foreground/50"><span>Under</span><span className="text-accent">Metered</span><span>Over</span></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <Setting label="ISO" value={iso} onChange={setIso} options={['100', '400', '800', '1600']} />
                <Setting label="Aperture" value={aperture} onChange={setAperture} options={['f/2.8', 'f/4', 'f/5.6']} />
                <Setting label="Shutter speed" value={shutter} onChange={setShutter} options={['1/125', '1/250', '1/500']} />
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><p className="text-xs text-muted-foreground">{selectedCopy.description}</p><button onClick={() => setActiveTool('Exposure')} className="flex items-center gap-2 text-xs font-semibold">{selectedCopy.action} <ArrowUpRight className="h-3.5 w-3.5" /></button></div>
          </div>
        </section>

      </main>

      <footer id="learn" className="border-t border-border"><div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Fieldcraft — tools for seeing clearly</p><div className="flex gap-5 text-xs text-muted-foreground"><a href="#tools" className="hover:text-foreground">About</a><a href="#learn" className="hover:text-foreground">Field notes</a><a href="#learn" className="hover:text-foreground">Changelog</a></div></div></footer>
    </div>
  )
}

function Setting({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"><span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="cursor-pointer bg-transparent text-right font-mono text-sm font-medium outline-none">{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}
