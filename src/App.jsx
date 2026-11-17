import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown, CreditCard, Gauge, Goal, LayoutDashboard, Lightbulb, LogOut, Menu, Moon, Plus, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Sun, Wallet, X } from 'lucide-react'
import { assessPurchase, calculateEmi, money } from './lib/finance.js'
import { apiRequest, authenticate, getSession, setSession } from './lib/api.js'
import { demo } from './data/demo.js'

const nav = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'simulator', label: 'Purchase simulator', icon: Gauge, badge: 'SIM' },
  { id: 'emi', label: 'EMI planner', icon: SlidersHorizontal },
  { id: 'activity', label: 'Transactions', icon: Activity },
  { id: 'goals', label: 'Savings goals', icon: Goal },
]

const cash = (n) => money(n)
const shortMoney = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Math.round(n / 1000)}k`
const localToday = () => { const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}` }
const demoActivity = demo.transactions.map((row,index)=>({...row,id:`demo-${index}`,date:'2026-11-16',rawCategory:row.category.split(' · ')[0]}))

function FloatingCard() {
  const group = useMemo(() => ({ current: null }), [])
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.36) * 0.22 - 0.1
      group.current.rotation.x = Math.cos(clock.getElapsedTime() * 0.28) * 0.07
      group.current.position.y = Math.sin(clock.getElapsedTime() * 0.6) * 0.06
    }
  })
  return <group ref={group} rotation={[0.02, -0.13, -0.08]}>
    <mesh castShadow><boxGeometry args={[3.5, 2.2, 0.08]} /><meshPhysicalMaterial color="#153c30" roughness={0.25} metalness={0.48} clearcoat={0.75} /></mesh>
    <mesh position={[-1.23, 0.49, 0.055]}><boxGeometry args={[0.42, 0.32, 0.025]} /><meshStandardMaterial color="#c9b777" metalness={0.7} roughness={0.28} /></mesh>
    <mesh position={[-1.18, -0.12, 0.054]}><boxGeometry args={[0.47, 0.045, 0.02]} /><meshStandardMaterial color="#91a79b" transparent opacity={0.8} /></mesh>
    <mesh position={[-0.8, -0.76, 0.055]}><boxGeometry args={[1.2, 0.05, 0.018]} /><meshStandardMaterial color="#93a69a" transparent opacity={0.72} /></mesh>
    <mesh position={[1.18, -0.76, 0.055]}><circleGeometry args={[0.22, 40]} /><meshStandardMaterial color="#d9ece1" transparent opacity={0.65} /></mesh>
    <mesh position={[1.43, -0.76, 0.056]}><circleGeometry args={[0.22, 40]} /><meshStandardMaterial color="#10b981" transparent opacity={0.72} /></mesh>
  </group>
}

function CardScene() {
  return <Canvas camera={{ position: [0, 0, 5.7], fov: 36 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
    <ambientLight intensity={1.45} /><pointLight position={[3, 3, 4]} intensity={30} color="#a5ffd8" /><pointLight position={[-3, -2, 2]} intensity={16} color="#22d3ee" />
    <FloatingCard />
  </Canvas>
}

function Tip({ children }) { return <Tooltip contentStyle={{ background: '#15211b', border: '1px solid #29382f', borderRadius: 12, color: '#ecf8f1', fontSize: 12 }} itemStyle={{ color: '#dff7e9' }} labelStyle={{ color: '#96a69b' }}>{children}</Tooltip> }

function Sidebar({ page, setPage, collapsed, setCollapsed, light, setLight, session, onAccount }) {
  return <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <div className="brand"><div className="brand-symbol"><span /></div><span className="brand-name">spend<span>wise</span></span><button className="icon-button sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar"><Menu size={17} /></button></div>
    <div className="workspace-label">SPATIAL NAVIGATION</div>
    <nav className="side-nav" aria-label="Main navigation">
      {nav.map(({ id, label, icon: Icon, badge }) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => { setPage(id); if (window.innerWidth < 680) setCollapsed(true) }} title={collapsed ? label : undefined}>
        <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{badge && <small>{badge}</small>}
      </button>)}
    </nav>
    <div className="side-spacer" />
    <div className="side-promo">
      <div className="promo-orbit"><Sparkles size={16} /></div>
      <strong>Your money.<br />Your space.</strong><p>See the whole picture. Choose your next move.</p>
      <div className="promo-progress"><span style={{ width: '68%' }} /></div><small>68% of your monthly goal</small>
    </div>
    <div className="sidebar-bottom">
      <button className="nav-item" onClick={() => setLight(!light)}><span className="theme-icon">{light ? <Sun size={17} /> : <Moon size={17} />}</span><span>{light ? 'Light appearance' : 'Dark appearance'}</span><span className="theme-state" /></button>
      <button className="nav-item" onClick={onAccount}><Settings size={17} /><span>Settings</span></button>
      <button className="profile-row profile-button" onClick={onAccount}><div className="avatar">{session?.user?.fullName?.split(/\s+/).map((n) => n[0]).join('').slice(0,2).toUpperCase() || 'AS'}</div><div className="profile-text"><strong>{session?.user?.fullName || 'Aarav Sharma'}</strong><small>{session ? 'Connected account' : 'Personal account'}</small></div><ChevronDown size={15} className="profile-chevron" /></button>
    </div>
  </aside>
}

function Header({ page, onNotify, notifications, title, onAccount, session }) {
  const [notices, setNotices] = useState([])
  const subtitle = page === 'overview' ? 'Your Money. Your Space. Your Control.' : page === 'simulator' ? 'A clearer view of what your next purchase could change.' : page === 'emi' ? 'Compare financing options before committing.' : page === 'goals' ? 'Progress feels better when you can see it.' : 'Your money, moving in and out.'
  const dateLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
  useEffect(() => {
    if (!session?.token) { setNotices([]); return }
    if (!notifications) return
    apiRequest('/notifications').then(setNotices).catch(() => setNotices([]))
  }, [session?.token, notifications])
  const markRead = async (notice) => {
    if (!notice.id || notice.read) return
    try { const updated=await apiRequest(`/notifications/${notice.id}/read`,{method:'PATCH'});setNotices((items)=>items.map((item)=>item.id===updated.id?updated:item)) } catch {}
  }
  return <header className="topbar">
    <div className="heading-block"><div className="eyebrow">{dateLabel} <span>·</span> YOUR FINANCIAL SPACE</div><h1>{title}</h1><p>{subtitle}</p></div>
    <div className="top-actions"><button className="notification-button" aria-label="Notifications" onClick={onNotify}><Bell size={18} />{(!session || notices.some((notice)=>!notice.read))&&<i />}</button><button className="avatar top-avatar account-avatar" aria-label="Account" onClick={onAccount}>{session?.user?.fullName?.split(/\s+/).map((n) => n[0]).join('').slice(0,2).toUpperCase() || 'AS'}</button></div>
    {notifications && <div className="notification-popover"><div className="popover-title"><strong>Notifications</strong><span className="live-dot" /></div>
      {session ? notices.length ? notices.map((notice)=> <button type="button" className={`notice ${notice.read?'read':'unread'}`} key={notice.id} onClick={()=>markRead(notice)}><div className="notice-icon"><Bell size={15}/></div><div><strong>{notice.title}</strong><p>{notice.message}</p><small>{new Date(notice.createdAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</small></div></button>) : <div className="notice-empty">No notifications yet. Payment reminders will appear here when you add financial records.</div> : <><div className="notice"><div className="notice-icon"><CalendarDays size={16} /></div><div><strong>EMI due in 4 days</strong><p>Your vehicle payment of ₹12,400 is coming up.</p><small>Today · 9:24 AM</small></div></div><div className="notice"><div className="notice-icon cyan"><ArrowUpRight size={16} /></div><div><strong>You’re saving consistently</strong><p>November savings are 8% ahead of your average.</p><small>Yesterday · 6:10 PM</small></div></div></>}
    </div>}
  </header>
}

function AccountDialog({ session, onClose, onAuthenticated, onLogout, onProfileUpdated, resetToken }) {
  const [mode, setMode] = useState(resetToken ? 'reset' : 'login')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [fields, setFields] = useState({ fullName: '', email: '', password: '' })
  const [profile, setProfile] = useState({ availableBalance: 0, monthlySalary: 0, essentialExpenses: 0, emergencySavings: 0, creditObligations: 0 })
  useEffect(() => { if (session) apiRequest('/profile').then((value) => setProfile((old) => ({ ...old, ...value }))).catch((e) => setError(e.message)) }, [session?.token])
  const setField = (key, value) => setFields((old) => ({ ...old, [key]: value }))
  const submitAuth = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      if (mode === 'forgot') { const response=await apiRequest('/auth/forgot-password',{method:'POST',body:JSON.stringify({email:fields.email})}); setNotice(response.message); setMode('login') }
      else if (mode === 'reset') { const response=await apiRequest('/auth/reset-password',{method:'POST',body:JSON.stringify({token:resetToken,password:fields.password})}); setNotice(response.message); setMode('login'); window.history.replaceState({},'',window.location.pathname) }
      else { const response = await authenticate(mode, fields); const signedIn = { token: response.token, user: response.user }; await onAuthenticated(signedIn); setNotice('Your account is connected securely.') }
    }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const submitProfile = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try { const value = await apiRequest('/profile', { method: 'PUT', body: JSON.stringify(Object.fromEntries(Object.entries(profile).map(([k,v]) => [k, Number(v) || 0]))) }); setProfile(value); await onProfileUpdated(); setNotice('Financial profile saved.') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <div className="modal-scrim" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><section className="account-dialog panel" role="dialog" aria-modal="true" aria-labelledby="account-title"><button className="dialog-close icon-button" aria-label="Close account dialog" onClick={onClose}><X size={17} /></button>
    <div className="account-dialog-brand"><div className="brand-symbol"><span /></div><span className="brand-name">spend<span>wise</span></span></div>
    {session ? <><div className="section-kicker">ACCOUNT CONNECTED</div><h2 id="account-title">Your financial profile</h2><p className="dialog-copy">Enter your own figures to personalize dashboard summaries and purchase estimates.</p><div className="connected-user"><div className="avatar">{session.user?.fullName?.split(/\s+/).map((n) => n[0]).join('').slice(0,2).toUpperCase()}</div><div><strong>{session.user?.fullName}</strong><span>{session.user?.email}</span></div><ShieldCheck size={16} /></div><form className="profile-form" onSubmit={submitProfile}><div className="profile-field-grid">{[['availableBalance','Available balance, excluding reserve'],['monthlySalary','Monthly take-home income'],['essentialExpenses','Monthly essential expenses'],['emergencySavings','Emergency savings'],['creditObligations','Monthly card and other debt payments, excluding EMIs']].map(([key,label])=><label className="field" key={key}><span>{label}</span><div className="input-prefix"><b>₹</b><input type="number" min="0" value={profile[key] ?? 0} onChange={(e)=>setProfile({...profile,[key]:e.target.value})}/></div></label>)}</div><button className="button-primary dialog-submit" disabled={busy}>{busy?'Saving…':'Save financial profile'} <ArrowRight size={14}/></button></form><button className="logout-link" onClick={onLogout}><LogOut size={14}/> Sign out</button></> : <><div className="section-kicker">YOUR MONEY, YOUR CALL</div><h2 id="account-title">{mode === 'forgot' ? 'Reset your password.' : mode === 'reset' ? 'Choose a new password.' : mode === 'login' ? 'Welcome back.' : 'Start with clarity.'}</h2><p className="dialog-copy">{mode === 'forgot' ? 'We’ll email a one-time reset link if an account exists for that address.' : mode === 'reset' ? 'Choose a new password for your SpendWise account.' : mode === 'login' ? 'Sign in to connect your personal financial profile.' : 'Create a secure account for your financial records.'}</p><div className="auth-tabs"><button className={mode==='login'?'selected':''} onClick={()=>{setMode('login');setError('')}}>Sign in</button><button className={mode==='register'?'selected':''} onClick={()=>{setMode('register');setError('')}}>Create account</button></div><form onSubmit={submitAuth} className="auth-form">{mode==='register'&&<label className="field"><span>Full name</span><input autoComplete="name" required maxLength="90" value={fields.fullName} onChange={(e)=>setField('fullName',e.target.value)} placeholder="Your name"/> </label>}<label className="field" style={{display:mode==='reset'?'none':undefined}}><span>Email address</span><input type="email" autoComplete="email" required={mode!=='reset'} value={fields.email} onChange={(e)=>setField('email',e.target.value)} placeholder="you@example.com"/></label><label className="field" style={{display:mode==='forgot'?'none':undefined}}><span>Password</span><input type="password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={mode==='register'||mode==='reset'?8:1} required={mode!=='forgot'} value={fields.password} onChange={(e)=>setField('password',e.target.value)} placeholder={mode==='register'||mode==='reset'?'At least 8 characters':'Your password'}/></label><button className="button-primary dialog-submit" disabled={busy}>{busy?'Please wait…':mode==='forgot'?'Send reset link':mode==='reset'?'Update password':mode==='login'?'Sign in securely':'Create secure account'} <ArrowRight size={14}/></button></form>{mode==='login'&&<button type="button" className="forgot-link" onClick={()=>{setMode('forgot');setError('');setNotice('')}}>Forgot password?</button>}{mode==='forgot'&&<button type="button" className="forgot-link" onClick={()=>setMode('login')}>Back to sign in</button>}<div className="auth-security"><ShieldCheck size={14}/> Passwords are securely hashed. Personal records are protected by your account.</div></>}
    {error&&<div className="dialog-error">{error}</div>}{notice&&<div className="dialog-notice"><Check size={14}/>{notice}</div>}
  </section></div>
}

function SpatialOrb({ parallax, reducedMotion }) {
  const orb = useRef(null)
  const camera = useThree((state) => state.camera)
  const stars = useMemo(() => {
    const values = new Float32Array(84 * 3)
    for (let i = 0; i < 84; i += 1) {
      const angle = i * 2.39996
      const radius = 1.38 + ((i * 17) % 31) / 34
      values[i * 3] = Math.cos(angle) * radius
      values[i * 3 + 1] = Math.sin(angle * 1.37) * (0.72 + ((i * 7) % 18) / 26)
      values[i * 3 + 2] = Math.sin(angle) * radius * 0.38
    }
    return values
  }, [])
  useFrame((state, delta) => {
    if (!orb.current || reducedMotion) return
    const pointer = parallax.current
    const step = Math.min(delta * 2.1, 1)
    orb.current.rotation.x += (pointer.y * 0.12 - orb.current.rotation.x) * step
    orb.current.rotation.z += (pointer.x * 0.1 - orb.current.rotation.z) * step
    orb.current.rotation.y += Math.min(delta, 0.04) * 0.11
    orb.current.position.y = Math.sin(state.clock.elapsedTime * 0.48) * 0.045
    camera.position.x += (pointer.x * 0.11 - camera.position.x) * step
    camera.position.y += (-pointer.y * 0.075 - camera.position.y) * step
    camera.lookAt(0, 0, 0)
  })
  return <>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars, 3]} /></bufferGeometry><pointsMaterial color="#73f5c6" size={0.023} transparent opacity={0.62} sizeAttenuation depthWrite={false} /></points>
    <pointLight color="#2ce0a5" intensity={4.2} distance={5.5} position={[1.15, 1.15, 2.5]} />
    <pointLight color="#22d3ee" intensity={2.5} distance={4.4} position={[-1.8, -0.65, 1.4]} />
    <group ref={orb}>
      <mesh><sphereGeometry args={[0.79, 48, 48]} /><meshPhysicalMaterial color="#0a4939" emissive="#063b2b" emissiveIntensity={0.8} metalness={0.34} roughness={0.2} clearcoat={1} clearcoatRoughness={0.15} /></mesh>
      <mesh scale={0.91}><sphereGeometry args={[0.79, 48, 48]} /><meshPhysicalMaterial color="#42d6a0" transparent opacity={0.12} roughness={0.1} metalness={0.12} clearcoat={1} /></mesh>
      <mesh rotation={[0.8, 0.25, 0.4]}><torusGeometry args={[1.01, 0.009, 8, 128]} /><meshBasicMaterial color="#70f3c0" transparent opacity={0.65} /></mesh>
      <mesh rotation={[1.22, -0.62, -0.26]}><torusGeometry args={[1.12, 0.006, 8, 128]} /><meshBasicMaterial color="#30c9e6" transparent opacity={0.55} /></mesh>
      <mesh rotation={[0.15, 0.8, 1.06]}><torusGeometry args={[0.91, 0.004, 6, 112]} /><meshBasicMaterial color="#d4fff0" transparent opacity={0.26} /></mesh>
      <mesh position={[0.42, 0.49, 0.42]}><sphereGeometry args={[0.055, 12, 12]} /><meshBasicMaterial color="#b8ffe8" /></mesh>
    </group>
  </>
}

function SpatialMetric({ slot, label, value, detail, Icon, tone, onClick }) {
  return <motion.button type="button" className={`spatial-metric ${slot} ${tone}`} onClick={onClick} whileHover={{ scale: 1.045, y: -4, z: 20 }} whileTap={{ scale: 0.975 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} aria-label={`${label}: ${value}. ${detail}. Open related records.`}>
    <span className="spatial-metric-icon"><Icon size={15} /></span><span className="spatial-metric-copy"><small>{label}</small><strong>{value}</strong><i>{detail}</i></span><ArrowRight className="spatial-metric-arrow" size={13} />
  </motion.button>
}

function SpatialCommandSpace({ setPage, balance, income, expenses, savings, investments, credit, isLive }) {
  const reducedMotion = useReducedMotion()
  const parallax = useRef({ x: 0, y: 0 })
  const moveLight = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    parallax.current = { x: (x - 0.5) * 2, y: (y - 0.5) * 2 }
    event.currentTarget.style.setProperty('--light-x', `${x * 100}%`)
    event.currentTarget.style.setProperty('--light-y', `${y * 100}%`)
  }
  const resetLight = (event) => {
    parallax.current = { x: 0, y: 0 }
    event.currentTarget.style.setProperty('--light-x', '50%')
    event.currentTarget.style.setProperty('--light-y', '50%')
  }
  return <motion.section className="spatial-command panel" onPointerMove={moveLight} onPointerLeave={resetLight} initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reducedMotion ? 0 : 0.62, ease: [.2, .8, .2, 1] }} aria-labelledby="spatial-title">
    <div className="spatial-command-head"><div><div className="spatial-kicker"><i /> FINANCIAL COMMAND SPACE</div><h2 id="spatial-title">Your Money. <em>Your Space.</em> Your Control.</h2><p>A live model of your financial world. Explore a signal to see its details.</p></div><span className={`spatial-presence ${isLive ? 'connected' : ''}`}><i />{isLive ? 'PROFILE IN SYNC' : 'PRIVATE DEMO'}</span></div>
    <div className="spatial-stage" role="group" aria-label="Interactive spatial overview of your finances">
      <div className="spatial-stage-light" />
      <div className="spatial-grid-plane" aria-hidden="true" />
      <div className="spatial-canvas" aria-hidden="true"><Canvas camera={{ position: [0, 0, 4.6], fov: 36 }} dpr={[1, 1.25]} gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }} frameloop={reducedMotion ? 'demand' : 'always'}><ambientLight intensity={0.32} /><SpatialOrb parallax={parallax} reducedMotion={reducedMotion} /></Canvas></div>
      <div className="spatial-core-readout"><span>AVAILABLE BALANCE</span><strong>{cash(balance)}</strong><small><i /> {isLive ? 'PERSONAL PROFILE' : 'DEMO ENVIRONMENT'}</small></div>
      <SpatialMetric slot="slot-income" label="Monthly income" value={cash(income)} detail="recorded inflow" Icon={ArrowDownLeft} tone="mint" onClick={() => setPage('activity')} />
      <SpatialMetric slot="slot-expenses" label="Monthly outflow" value={cash(expenses)} detail="essential + flexible" Icon={ArrowUpRight} tone="cyan" onClick={() => setPage('activity')} />
      <SpatialMetric slot="slot-savings" label="Net savings" value={cash(savings)} detail="this month" Icon={Wallet} tone="violet" onClick={() => setPage('goals')} />
      <SpatialMetric slot="slot-investments" label="Invested this month" value={cash(investments)} detail="from recorded categories" Icon={Activity} tone="gold" onClick={() => setPage('activity')} />
      <span className="spatial-axis axis-one" aria-hidden="true" /><span className="spatial-axis axis-two" aria-hidden="true" />
      <div className="spatial-arc-label"><span>01</span> CASH FLOW <i /> <span>02</span> SAVINGS <i /> <span>03</span> NEXT MOVE</div>
    </div>
    <div className="spatial-command-foot"><span><ShieldCheck size={14} /> Personal figures stay private</span><button className="spatial-launch" onClick={() => setPage('simulator')}>Simulate a purchase <ArrowRight size={14} /></button><span className="spatial-credit"><CreditCard size={14} /> Card obligations {cash(credit)}</span></div>
  </motion.section>
}

function Overview({ setPage, savedSimulations, liveDashboard, session }) {
  const live = liveDashboard ? {
    balance: liveDashboard.profile.availableBalance,
    salary: liveDashboard.monthIncome,
    monthlyExpenses: liveDashboard.monthExpenses,
    savingsRate: Number(liveDashboard.savingsRate) || 0,
  } : demo
  const [period, setPeriod] = useState('6 months')
  const trendSource = liveDashboard?.monthlyTrend || demo.trend
  const trend = period === '6 months' ? trendSource.slice(-6) : trendSource
  const categories = liveDashboard ? liveDashboard.expenseBreakdown : demo.categories
  const categoryTotal = categories.reduce((sum, item) => sum + Number(item.amount), 0)
  const [recent, setRecent] = useState(session ? [] : demo.transactions)
  useEffect(() => {
    if (!session?.token) { setRecent(demo.transactions); return }
    Promise.all([apiRequest('/incomes'), apiRequest('/expenses')]).then(([incomeRows, expenseRows]) => {
      const activity = [
        ...incomeRows.map((r) => ({ name:r.source, category:`Income · ${r.date}`, amount:Number(r.amount), type:'income', date:r.date })),
        ...expenseRows.map((r) => ({ name:r.description, category:`${r.category} · ${r.date}`, amount:-Number(r.amount), type:'expense', date:r.date })),
      ].sort((a,b) => String(b.date).localeCompare(String(a.date))).slice(0,4)
      setRecent(activity)
    }).catch(() => setRecent([]))
  }, [session?.token])
  const priorExpenses = Number(trend.at(-2)?.expenses || 0)
  const currentExpenses = Number(trend.at(-1)?.expenses || 0)
  const expenseChange = priorExpenses ? Math.round(Math.abs(currentExpenses-priorExpenses)/priorExpenses*100) : 0
  const investmentSpend = categories.filter((item) => /invest|mutual fund|stocks?|sip/i.test(item.name)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const dashboard = <>
    <SpatialCommandSpace setPage={setPage} balance={live.balance} income={live.salary} expenses={live.monthlyExpenses} savings={liveDashboard?.monthlySavings ?? demo.savings} investments={investmentSpend} credit={liveDashboard?.cardOutstanding ?? demo.creditOutstanding} isLive={Boolean(liveDashboard)} />
    <section className="obligation-strip"><div><span>Monthly EMI commitments</span><strong>{cash(liveDashboard?.totalMonthlyEmi ?? demo.emi)}</strong></div><div><span>Credit card outstanding</span><strong>{cash(liveDashboard?.cardOutstanding ?? demo.creditOutstanding)}</strong></div><button className="text-link" onClick={() => setPage('emi')}>View payments <ArrowRight size={13}/></button></section>
    <section className="overview-grid">
      <motion.article className="panel trend-panel" initial={{ opacity: 0, y: 18, rotateX: 1 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, amount: .18 }} transition={{ delay: .08, duration: .5 }}>
        <div className="panel-header"><div><div className="section-kicker">CASH FLOW</div><h2>Income & spending</h2><p>Your monthly money rhythm</p></div><button className="select-control" onClick={() => setPeriod(period === '6 months' ? '12 months' : '6 months')}>{period}<ChevronDown size={14} /></button></div>
        <div className="chart-legend"><span><i className="legend-dot emerald" /> Income</span><span><i className="legend-dot cyan" /> Expenses</span><span><i className="legend-dot violet" /> Savings</span><strong>Net savings <b>{cash(liveDashboard?.monthlySavings ?? demo.savings)}</b></strong></div>
        <div className="trend-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 14, right: 7, left: -13, bottom: 0 }}>
          <defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.21} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.12} /><stop offset="100%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient><linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b7cf6" stopOpacity={0.12} /><stop offset="100%" stopColor="#8b7cf6" stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid stroke="#24312a" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#74827a', fontSize: 11 }} dy={8} /><YAxis axisLine={false} tickLine={false} tickFormatter={shortMoney} tick={{ fill: '#74827a', fontSize: 10 }} /><Tip /><Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.4} fill="url(#incomeFill)" activeDot={{ r: 4, fill: '#10b981', stroke: '#10231a', strokeWidth: 2 }} /><Area type="monotone" dataKey="expenses" stroke="#22d3ee" strokeWidth={2} fill="url(#expenseFill)" activeDot={{ r: 4, fill: '#22d3ee', stroke: '#10231a', strokeWidth: 2 }} /><Area type="monotone" dataKey="savings" stroke="#8b7cf6" strokeWidth={1.8} fill="url(#savingsFill)" activeDot={{ r: 3.5, fill: '#8b7cf6', stroke: '#10231a', strokeWidth: 2 }} />
        </AreaChart></ResponsiveContainer></div>
        <div className="chart-footer"><span><span className="footer-spark">↗</span> {liveDashboard ? 'Trend from your saved income and expenses' : <>Income increased by <strong>₹3,000</strong> this month</>}</span><span className="chart-updated">Updated just now</span></div>
      </motion.article>
      <motion.article className="panel category-panel" initial={{ opacity: 0, y: 18, rotateX: 1 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, amount: .18 }} transition={{ delay: .13, duration: .5 }}>
        <div className="panel-header"><div><div className="section-kicker">SPENDING BREAKDOWN</div><h2>Where it goes</h2><p>This month’s expenses</p></div></div>
        <div className="donut-wrap"><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius="69%" outerRadius="91%" paddingAngle={3} stroke="none" cornerRadius={3}>{categories.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tip /></PieChart></ResponsiveContainer></div><div className="donut-label"><strong>{cash(liveDashboard ? categoryTotal : demo.monthlyExpenses)}</strong><span>Total spent</span></div></div>
        <div className="category-list">{categories.length ? categories.slice(0, 4).map((item) => <div className="category-row" key={item.name}><span className="category-name"><i style={{ background: item.color }} />{item.name}</span><span>{cash(item.amount)}</span><small>{Math.round(Number(item.amount) / (categoryTotal || 1) * 100)}%</small></div>) : <div className="category-empty">Record an expense to see your breakdown.</div>}</div>
      </motion.article>
    </section>
    <section className="bottom-grid">
      <motion.article className="panel transactions-panel" initial={{ opacity: 0, y: 18, rotateX: 1 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, amount: .18 }} transition={{ delay: .08, duration: .5 }}>
        <div className="panel-header compact"><div><div className="section-kicker">RECENT ACTIVITY</div><h2>Your latest moves</h2></div><button className="text-link" onClick={() => setPage('activity')}>All activity <ArrowRight size={14} /></button></div>
        <div className="transaction-list">{recent.length ? recent.map((t, i) => <div className="transaction-row" key={`${t.name}-${i}`}><div className={`transaction-icon ${t.type}`}>{t.type === 'income' ? <ArrowDownLeft size={16} /> : <CreditCard size={15} />}</div><div className="transaction-info"><strong>{t.name}</strong><span>{t.category}</span></div><div className={`transaction-amount ${t.type}`}>{t.amount > 0 ? '+' : '−'}{cash(Math.abs(t.amount))}</div><div className="transaction-date">{t.date ? new Date(`${t.date}T12:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : 'Today'}</div></div>) : <div className="category-empty">Your saved income and expenses will appear here.</div>}</div>
      </motion.article>
      <motion.article className="panel insight-panel" initial={{ opacity: 0, y: 18, rotateX: 1 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, amount: .18 }} transition={{ delay: .13, duration: .5 }}>
        <div className="insight-top"><span className="insight-icon"><Lightbulb size={17} /></span><span className="insight-tag">SMART INSIGHT</span><span className="insight-pulse" /></div>
        {liveDashboard ? <><h3>{priorExpenses ? <>Your recorded spending<br /><span>{currentExpenses <= priorExpenses ? 'is trending down.' : 'is trending up.'}</span></> : <>Your money picture<br /><span>starts with a few entries.</span></>}</h3><p>{priorExpenses ? <>Monthly expenses are {expenseChange}% {currentExpenses <= priorExpenses ? 'lower' : 'higher'} than the previous month in your records.</> : 'Add income and expense entries to build a personal trend and spending breakdown.'}</p></> : <><h3>Your spending has a<br /><span>healthy rhythm.</span></h3><p>You’ve spent <strong>12% less</strong> on dining this month. Keeping this pace could add <strong>₹4,200</strong> to your savings.</p></>}
        <button className="insight-cta" onClick={() => setPage('simulator')}>Explore a purchase <ArrowRight size={15} /></button>
        <div className="insight-wave" />
      </motion.article>
    </section>
    {savedSimulations.length > 0 && <section className="panel purchase-history"><div className="panel-header compact"><div><div className="section-kicker">PURCHASE HISTORY</div><h2>Past decisions, at a glance.</h2></div></div><div className="transaction-list">{savedSimulations.slice(0,5).map((item,i)=><div className="transaction-row" key={`${item.id||item.product}-${i}`}><div className="transaction-icon income"><Gauge size={15}/></div><div className="transaction-info"><strong>{item.product}</strong><span>{item.createdAt?new Date(item.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'Saved in this session'} · Score {item.score ?? '—'}/100</span></div><div className="transaction-amount">{cash(item.price)}</div><span className="paid-tag"><i />{item.recommendation||item.status||'Saved'}</span></div>)}</div></section>}
  </>
  return dashboard
}

function ScoreRing({ score, status }) {
  const color = status === 'Affordable' ? '#10b981' : status === 'Risky' ? '#f3a95f' : '#fb7185'
  return <div className="score-ring" style={{ '--score-color': color, '--score-angle': `${score * 3.6}deg` }}><div className="score-ring-inner"><strong>{score}</strong><span>out of 100</span></div></div>
}

function Simulator({ onSave, profile }) {
  const [form, setForm] = useState({ product: 'MacBook Pro 14”', price: 199900, balance: demo.balance, emergencySavings: demo.emergencySavings, income: demo.salary, expenses: demo.monthlyExpenses, emi: demo.emi, credit: demo.creditOutstanding, monthsUntil: 0 })
  const [saved, setSaved] = useState(false)
  const [edited, setEdited] = useState(false)
  useEffect(() => {
    if (profile && !edited) setForm((old) => ({ ...old, balance:profile.availableBalance ?? old.balance, emergencySavings:profile.emergencySavings ?? old.emergencySavings, income:profile.monthlySalary ?? old.income, expenses:profile.essentialExpenses ?? old.expenses, emi:profile.totalMonthlyEmi ?? old.emi, credit:profile.creditObligations ?? old.credit }))
  }, [profile, edited])
  const result = assessPurchase(form)
  const update = (key, value) => { setForm((old) => ({ ...old, [key]: value })); setSaved(false); setEdited(true) }
  const save = () => { onSave({ ...form, ...result, id: Date.now() }); setSaved(true) }
  return <div className="simulator-layout">
    <div className="simulator-main">
      <div className="sim-intro"><span className="sim-orb"><Sparkles size={18} /></span><div><div className="section-kicker">THE SPENDWISE SIMULATOR</div><h2>Think it through, <em>before</em> you buy.</h2><p>Bring your real numbers. We’ll help you see the bigger picture.</p></div></div>
      <div className="panel sim-form-panel">
        <div className="form-section-head"><span className="step-num">01</span><div><strong>The purchase</strong><span>What are you considering?</span></div></div>
        <div className="field-grid two"><label className="field"><span>Product or purchase</span><input value={form.product} onChange={(e) => update('product', e.target.value)} placeholder="e.g. a new laptop" /></label><label className="field"><span>Price <i>INR</i></span><div className="input-prefix"><b>₹</b><input type="number" min="0" value={form.price} onChange={(e) => update('price', e.target.value)} /></div></label></div>
        <div className="price-slider-row"><input type="range" min="1000" max="1000000" step="1000" value={Math.min(1000000, Number(form.price) || 0)} style={{ '--range': `${Math.min(100, ((Number(form.price) || 0) - 1000) / 999000 * 100)}%` }} onChange={(e) => update('price', e.target.value)} aria-label="Purchase price"/><span>{cash(form.price)}</span></div>
        <div className="form-section-head second"><span className="step-num">02</span><div><strong>Your monthly picture</strong><span>Estimates are okay. You’re in control.</span></div><span className="privacy-label"><ShieldCheck size={13} /> Private to you</span></div>
        <div className="field-grid two">
          {[
            ['balance','Available balance, excluding reserve','wallet'],
            ['emergencySavings','Emergency savings set aside','reserve'],
            ['income','Monthly take-home income','income'],
            ['expenses','Monthly essential expenses','expense'],
            ['emi','Monthly EMI payments','debt'],
            ['credit','Monthly card / other debt payments','debt'],
          ].map(([key, label]) => <label className="field" key={key}><span>{label}<i>{key === 'income' ? 'MONTHLY' : ''}</i></span><div className="input-prefix"><b>₹</b><input type="number" min="0" value={form[key]} onChange={(e) => update(key, e.target.value)} /></div></label>)}
          <label className="field"><span>When do you plan to buy?</span><select value={form.monthsUntil} onChange={(e) => update('monthsUntil', e.target.value)}><option value="0">This month</option><option value="1">In 1 month</option><option value="2">In 2 months</option><option value="3">In 3 months</option><option value="6">In 6 months</option></select></label>
        </div>
        <div className="sim-disclaimer"><ShieldCheck size={15} /> Your numbers stay in this browser session. SpendWise does not connect to a bank or verify balances.</div>
      </div>
      <button className={`button-primary save-sim ${saved ? 'saved' : ''}`} onClick={save}>{saved ? <><Check size={16} /> Saved to your session</> : <>Save this simulation <ArrowRight size={16} /></>}</button>
    </div>
    <aside className="sim-result-column">
      <div className="panel result-panel">
        <div className="result-heading"><div><div className="section-kicker">YOUR AFFORDABILITY SNAPSHOT</div><h3>The impact, at a glance.</h3></div><span className="result-live"><i /> LIVE</span></div>
        <div className="result-status"><ScoreRing score={result.score} status={result.status} /><div className="result-status-copy"><span className={`status-pill ${result.status.toLowerCase().replaceAll(' ', '-')}`}>{result.status === 'Affordable' ? <Check size={13} /> : <Activity size={13} />}{result.status}</span><h2>{result.status === 'Affordable' ? 'Looks manageable.' : result.status === 'Risky' ? 'Take a second look.' : 'Let’s press pause.'}</h2><p>{result.explanation}</p></div></div>
        <div className="result-divider" />
        <div className="result-stats"><div><span>Projected balance after</span><strong className={result.cashAfterPurchase < 0 ? 'negative' : ''}>{cash(result.cashAfterPurchase)}</strong></div><div><span>Monthly surplus</span><strong>{cash(result.monthlySurplus)}</strong></div><div><span>Emergency cover after</span><strong>{result.monthsOfCover.toFixed(1)} <small>months</small></strong></div><div><span>Recovery time</span><strong>{result.recoveryMonths === null ? 'No surplus' : `${result.recoveryMonths} ${result.recoveryMonths === 1 ? 'month' : 'months'}`}</strong></div></div>
        <div className="buffer-callout"><span className="buffer-icon"><ShieldCheck size={16} /></span><div><strong>3-month safety buffer</strong><span>Suggested reserve: {cash(result.emergencyTarget)}</span></div><div className="buffer-state">{result.remainingReserves >= result.emergencyTarget ? <><Check size={13} /> Covered</> : <><Activity size={13} /> Short by {cash(Math.max(0, result.emergencyTarget - result.remainingReserves))}</>}</div></div>
        <div className="disclaimer">An educational estimate based on the numbers you entered—not financial advice. Consider upcoming costs and your personal circumstances.</div>
      </div>
      <div className="panel reassurance-panel"><div className="reassurance-icon"><Lightbulb size={16} /></div><div><strong>One small thought</strong><p>Could waiting one month improve your buffer? Try a different date and watch the estimate update.</p></div></div>
    </aside>
  </div>
}

function EmiPlanner({ session, onDataChanged, demoPlans, onDemoPlansChange }) {
  const [principal, setPrincipal] = useState(180000)
  const [down, setDown] = useState(30000)
  const [rate, setRate] = useState(12.5)
  const [months, setMonths] = useState(12)
  const [label,setLabel]=useState('')
  const [nextPaymentDate,setNextPaymentDate]=useState('')
  const [accountPlans,setAccountPlans]=useState([])
  const plans=session?.token?accountPlans:demoPlans
  const [planError,setPlanError]=useState('')
  useEffect(()=>{
    if(!session?.token){setAccountPlans([]);return}
    apiRequest('/emis').then(setAccountPlans).catch(()=>setAccountPlans([]))
  },[session?.token])
  const loan = Math.max(0, Number(principal) - Number(down))
  const estimate = calculateEmi(loan, rate, months)
  const comparisons = [6, 12, 18, 24, 36].map((m) => ({ tenure: `${m} mo`, ...calculateEmi(loan, rate, m) }))
  const chartData = [{ name: 'Principal', value: estimate.principal, color: '#10b981' }, { name: 'Interest', value: Math.max(0, estimate.interest), color: '#22d3ee' }]
  const savePlan=async(e)=>{
    e.preventDefault();setPlanError('')
    if(!label.trim()||Number(down)>Number(principal)){setPlanError('Enter a plan name and a valid down payment.');return}
    try{
      const body={label:label.trim(),principal:Number(principal),downPayment:Number(down),annualRate:Number(rate),termMonths:Number(months),nextPaymentDate:nextPaymentDate||null}
      const saved=session?.token?await apiRequest('/emis',{method:'POST',body:JSON.stringify(body)}):{id:Date.now(),...body,monthlyPayment:estimate.payment}
      if(session?.token)setAccountPlans((items)=>[saved,...items]);else onDemoPlansChange((items)=>[saved,...items]);setLabel('');setNextPaymentDate('');if(session?.token)await onDataChanged?.()
    }catch(error){setPlanError(error.message)}
  }
  return <div className="emi-layout"><div className="panel emi-controls">
    <div className="panel-header"><div><div className="section-kicker">EMI PLANNER</div><h2>Make the math make sense.</h2><p>Compare monthly comfort with total cost.</p></div><span className="emi-icon"><SlidersHorizontal size={17} /></span></div>
    <div className="emi-fields"><label className="field"><span>Purchase price</span><div className="input-prefix"><b>₹</b><input type="number" value={principal} min="0" onChange={(e) => {const value=Number(e.target.value);setPrincipal(value);setDown((old)=>Math.min(old,value))}} /></div></label><label className="field"><span>Down payment</span><div className="input-prefix"><b>₹</b><input type="number" value={down} min="0" max={principal} onChange={(e) => setDown(Math.min(Number(e.target.value), principal))} /></div></label><label className="field"><span>Annual interest rate <i>% P.A.</i></span><div className="input-suffix"><input type="number" value={rate} min="0" step="0.1" onChange={(e) => setRate(Number(e.target.value))} /><b>%</b></div></label><label className="field"><span>Loan duration <i>MONTHS</i></span><select value={months} onChange={(e) => setMonths(Number(e.target.value))}>{[6,12,18,24,36,48,60].map((m) => <option key={m} value={m}>{m} months</option>)}</select></label></div>
    <div className="emi-result"><div><span>Estimated monthly EMI</span><strong>{cash(estimate.payment)}<small> / month</small></strong></div><div className="emi-result-icon"><CalendarDays size={18} /></div></div>
    <div className="equation-note">{rate === 0 ? 'Zero-interest plan: principal divided across the selected months.' : 'Calculated using the standard reducing-balance EMI formula.'}</div>
  </div><div className="emi-side"><div className="panel loan-breakdown"><div className="panel-header compact"><div><div className="section-kicker">TOTAL REPAYMENT</div><h2>What it adds up to</h2></div></div><div className="loan-summary"><div className="loan-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" stroke="none" paddingAngle={3}>{chartData.map((d) => <Cell key={d.name} fill={d.color} />)}</Pie></PieChart></ResponsiveContainer><span className="loan-donut-label"><small>TOTAL</small><b>{shortMoney(estimate.total)}</b></span></div><div className="loan-stats"><div><span><i className="legend-dot emerald" />Principal</span><strong>{cash(estimate.principal)}</strong></div><div><span><i className="legend-dot cyan" />Total interest</span><strong>{cash(estimate.interest)}</strong></div><div className="loan-total"><span>Total repayment</span><strong>{cash(estimate.total)}</strong></div></div></div><div className="interest-note"><Sparkles size={14} /> Interest is {estimate.principal ? (estimate.interest / estimate.principal * 100).toFixed(1) : '0.0'}% of the amount financed.</div></div>
    <div className="panel compare-panel"><div className="panel-header compact"><div><div className="section-kicker">TENURE COMPARISON</div><h2>Monthly payment vs total interest</h2></div></div><div className="compare-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={comparisons} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}><CartesianGrid stroke="#24312a" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="tenure" axisLine={false} tickLine={false} tick={{ fill: '#76847b', fontSize: 10 }} dy={8} /><YAxis axisLine={false} tickLine={false} tickFormatter={shortMoney} tick={{ fill: '#76847b', fontSize: 9 }} /><Tip /><Bar dataKey="payment" name="Monthly EMI" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="interest" name="Total interest" fill="#22d3ee" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div><div className="compare-insight"><span className="insight-icon small"><Lightbulb size={14} /></span><span>Longer tenure lowers the monthly bill, but usually means more interest over time.</span></div></div></div>
    <section className="panel emi-records"><div className="panel-header"><div><div className="section-kicker">UPCOMING COMMITMENTS</div><h2>Your active EMIs</h2><p>Save a plan to include it in your monthly commitments.</p></div></div><form className="emi-record-form" onSubmit={savePlan}><label className="field"><span>Purchase or loan</span><input value={label} onChange={(e)=>setLabel(e.target.value)} placeholder="e.g. Laptop financing" required/></label><label className="field"><span>Next payment date</span><input type="date" value={nextPaymentDate} onChange={(e)=>setNextPaymentDate(e.target.value)}/></label><button className="button-primary add-button" type="submit">Save this EMI</button></form>{planError&&<div className="entry-error">{planError}</div>}<div className="emi-record-list">{plans.length?plans.map((plan)=> <div className="emi-record-row" key={plan.id}><div><strong>{plan.label}</strong><span>{plan.termMonths} months · {plan.annualRate}% annual rate</span></div><b>{cash(plan.monthlyPayment)}<small> / month</small></b><span className="emi-date">{plan.nextPaymentDate?`Next ${new Date(`${plan.nextPaymentDate}T12:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}`:'No due date set'}</span></div>):<div className="category-empty">{session?'No saved EMI plans yet.':'Demo plans last for this app session.'}</div>}</div></section>
    <p className="page-disclaimer"><ShieldCheck size={14} /> Estimates use a fixed rate and regular monthly payments. Lender fees, taxes, and changing rates are not included.</p>
  </div>
}

function CreditCardSection({ session, onDataChanged }) {
  const sampleCard = { id:null, name:'SpendWise Visa', lastFour:'4928', creditLimit:100000, outstanding:demo.creditOutstanding, availableCredit:100000-demo.creditOutstanding, utilization:demo.creditOutstanding/100000*100, dueDate:'2026-11-20' }
  const [cards,setCards]=useState(session?[]:[sampleCard])
  const [selected,setSelected]=useState(0)
  const [transactions,setTransactions]=useState([])
  const [addingCard,setAddingCard]=useState(false)
  const [addingTransaction,setAddingTransaction]=useState(false)
  const [error,setError]=useState('')
  const [cardForm,setCardForm]=useState({name:'',lastFour:'',creditLimit:'',outstanding:'',dueDate:''})
  const [txnForm,setTxnForm]=useState({description:'',amount:'',date:localToday()})
  const card=cards[selected]||null
  useEffect(()=>{
    if(!session?.token){setCards([sampleCard]);setSelected(0);return}
    apiRequest('/cards').then((items)=>{setCards(items);setSelected(0)}).catch(()=>setCards([]))
  },[session?.token])
  useEffect(()=>{
    if(!session?.token||!card?.id){setTransactions([]);return}
    apiRequest(`/cards/${card.id}/transactions`).then(setTransactions).catch(()=>setTransactions([]))
  },[session?.token,card?.id])
  const createCard=async(e)=>{
    e.preventDefault();setError('')
    try{
      const body={name:cardForm.name.trim(),lastFour:cardForm.lastFour,creditLimit:Number(cardForm.creditLimit),outstanding:Number(cardForm.outstanding)||0,dueDate:cardForm.dueDate||null}
      if(!body.name||!/^\d{4}$/.test(body.lastFour)||body.creditLimit<=0||body.outstanding>body.creditLimit)throw new Error('Enter a card name, its last four digits, and valid balances.')
      const saved=session?.token?await apiRequest('/cards',{method:'POST',body:JSON.stringify(body)}):{id:`local-${Date.now()}`,...body,availableCredit:body.creditLimit-body.outstanding,utilization:body.creditLimit?body.outstanding/body.creditLimit*100:0}
      setCards([saved,...cards]);setSelected(0);setCardForm({name:'',lastFour:'',creditLimit:'',outstanding:'',dueDate:''});setAddingCard(false)
      if(session?.token)await onDataChanged?.()
    }catch(e){setError(e.message)}
  }
  const createTransaction=async(e)=>{
    e.preventDefault();setError('')
    try{
      if(!card)throw new Error('Add a credit card first.')
      const body={description:txnForm.description.trim(),amount:Number(txnForm.amount),date:txnForm.date}
      if(!body.description||body.amount<=0)throw new Error('Enter a description and a positive amount.')
      if(session?.token){const created=await apiRequest(`/cards/${card.id}/transactions`,{method:'POST',body:JSON.stringify(body)});const refreshed=await apiRequest('/cards');setCards(refreshed);setTransactions((list)=>[created,...list]);await onDataChanged?.()}
      else{const nextOutstanding=Number(card.outstanding)+body.amount;if(nextOutstanding>Number(card.creditLimit))throw new Error('That transaction would exceed the card limit.');const next={...card,outstanding:nextOutstanding,availableCredit:Number(card.creditLimit)-nextOutstanding,utilization:nextOutstanding/Number(card.creditLimit)*100};setCards(cards.map((item,i)=>i===selected?next:item));setTransactions((list)=>[{...body,id:Date.now(),cardId:card.id},...list])}
      setTxnForm({description:'',amount:'',date:localToday()});setAddingTransaction(false)
    }catch(e){setError(e.message)}
  }
  const dateLabel=card?.dueDate?new Date(`${card.dueDate}T12:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}):'No due date set'
  return <>
    <section className="credit-row">
      {card?<div className="panel credit-card-panel"><div className="credit-visual"><div className="credit-scene"><CardScene /></div><div className="credit-wordmark">{card.name} <span>VISA</span></div><div className="credit-number">••••&nbsp; ••••&nbsp; ••••&nbsp; {card.lastFour}</div><div className="credit-holder">{session?.user?.fullName?.toUpperCase()||'AARAV SHARMA'} <span>•• / ••</span></div></div><div className="credit-meta"><div><span>AVAILABLE CREDIT</span><strong>{cash(card.availableCredit)}</strong></div><span className="utilization">{Number(card.utilization).toFixed(1)}% utilization</span><div className="credit-progress"><i style={{width:`${Math.min(100,Number(card.utilization))}%`}}/></div><small>Outstanding {cash(card.outstanding)} of {cash(card.creditLimit)}</small><div className="credit-controls"><button className="text-link" onClick={()=>setAddingCard(!addingCard)}><Plus size={12}/> Add card</button><button className="text-link" onClick={()=>{setAddingTransaction(!addingTransaction);setError('')}}><Plus size={12}/> Add transaction</button>{cards.length>1&&<button className="text-link" onClick={()=>setSelected((selected+1)%cards.length)}>Next card <ArrowRight size={12}/></button>}</div></div></div>
      :<div className="panel credit-card-empty"><span className="summary-icon saving"><CreditCard size={18}/></span><strong>No credit cards added</strong><p>Add a card to track its credit limit, balance, transactions, and due date.</p><button className="button-primary add-button" onClick={()=>setAddingCard(true)}><Plus size={14}/> Add a card</button></div>}
      <div className="panel due-card"><div className="due-icon"><CalendarDays size={17} /></div><div className="section-kicker">NEXT PAYMENT</div><h3>Card balance</h3><strong>{card?cash(card.outstanding):cash(0)}</strong><p>{card?<>Next payment date: <b>{dateLabel}</b></>:'Add a card and due date to track payments.'}</p><button className="text-link" onClick={()=>setAddingCard(true)}>Manage cards <ArrowRight size={13} /></button></div>
    </section>
    {addingCard&&<form className="panel credit-entry" onSubmit={createCard}><div className="section-kicker">ADD CREDIT CARD</div><div className="credit-entry-grid"><label className="field"><span>Card name</span><input value={cardForm.name} onChange={(e)=>setCardForm({...cardForm,name:e.target.value})} placeholder="e.g. Travel rewards" required/></label><label className="field"><span>Last four digits</span><input value={cardForm.lastFour} onChange={(e)=>setCardForm({...cardForm,lastFour:e.target.value.replace(/\D/g,'').slice(0,4)})} inputMode="numeric" maxLength="4" placeholder="4928" required/></label><label className="field"><span>Credit limit</span><div className="input-prefix"><b>₹</b><input type="number" min="1" value={cardForm.creditLimit} onChange={(e)=>setCardForm({...cardForm,creditLimit:e.target.value})} required/></div></label><label className="field"><span>Current outstanding</span><div className="input-prefix"><b>₹</b><input type="number" min="0" value={cardForm.outstanding} onChange={(e)=>setCardForm({...cardForm,outstanding:e.target.value})}/></div></label><label className="field"><span>Payment due date</span><input type="date" value={cardForm.dueDate} onChange={(e)=>setCardForm({...cardForm,dueDate:e.target.value})}/></label><button className="button-primary add-button">Save card</button></div>{error&&<div className="entry-error">{error}</div>}</form>}
    {addingTransaction&&card&&<form className="panel credit-entry" onSubmit={createTransaction}><div className="section-kicker">ADD CARD TRANSACTION</div><div className="credit-entry-grid transaction-entry-grid"><label className="field"><span>Description</span><input value={txnForm.description} onChange={(e)=>setTxnForm({...txnForm,description:e.target.value})} placeholder="e.g. Online purchase" required/></label><label className="field"><span>Amount</span><div className="input-prefix"><b>₹</b><input type="number" min="1" value={txnForm.amount} onChange={(e)=>setTxnForm({...txnForm,amount:e.target.value})} required/></div></label><label className="field"><span>Date</span><input type="date" value={txnForm.date} onChange={(e)=>setTxnForm({...txnForm,date:e.target.value})} required/></label><button className="button-primary add-button">Save transaction</button></div>{error&&<div className="entry-error">{error}</div>}</form>}
    {transactions.length>0&&<div className="panel card-history"><div className="panel-header compact"><div><div className="section-kicker">CARD ACTIVITY</div><h2>Recent card transactions</h2></div></div><div className="transaction-list">{transactions.slice(0,4).map((t,i)=><div className="transaction-row" key={`${t.id||t.date}-${i}`}><div className="transaction-icon expense"><CreditCard size={15}/></div><div className="transaction-info"><strong>{t.description}</strong><span>{t.date}</span></div><div className="transaction-amount">−{cash(t.amount)}</div></div>)}</div></div>}
    {error&&!addingCard&&!addingTransaction&&<div className="entry-error">{error}</div>}
  </>
}

function ActivityPage({ session, liveDashboard, onDataChanged }) {
  const activityIncome = liveDashboard?.monthIncome ?? demo.salary
  const activityExpenses = liveDashboard?.monthExpenses ?? demo.monthlyExpenses
  const activitySavings = liveDashboard?.monthlySavings ?? demo.savings
  const [filter, setFilter] = useState('All activity')
  const [range, setRange] = useState('All time')
  const [showForm, setShowForm] = useState(false)
  const [entryType, setEntryType] = useState('expense')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Other')
  const [editingId, setEditingId] = useState(null)
  const [rows, setRows] = useState(session ? [] : demoActivity)
  const [entryError, setEntryError] = useState('')
  const [budgets,setBudgets]=useState([])
  const [budgetCategories,setBudgetCategories]=useState([])
  const [budgetCategory,setBudgetCategory]=useState('')
  const [budgetLimit,setBudgetLimit]=useState('')
  const [budgetError,setBudgetError]=useState('')
  useEffect(() => {
    if (!session?.token) { setRows(demoActivity); return }
    Promise.all([apiRequest('/incomes'), apiRequest('/expenses')]).then(([incomeRows, expenseRows]) => setRows([
      ...incomeRows.map((r) => ({ id:r.id, date:r.date, name: r.source, category: `Income · ${r.date}`, amount: Number(r.amount), type: 'income', icon: '↗' })),
      ...expenseRows.map((r) => ({ id:r.id, date:r.date, rawCategory:r.category, name: r.description, category: `${r.category} · ${r.date}`, amount: -Number(r.amount), type: 'expense', icon: '•' })),
    ])).catch(() => setRows([]))
  }, [session?.token])
  useEffect(()=>{
    if(!session?.token){setBudgets([]);setBudgetCategories([]);return}
    Promise.all([apiRequest('/budgets'),apiRequest('/categories')]).then(([values,categories])=>{setBudgets(values);setBudgetCategories(categories)}).catch(()=>{setBudgets([]);setBudgetCategories([])})
  },[session?.token])
  const rangeOptions=['Day','Week','Month','Year','All time']
  const now=new Date()
  const todayKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const weekStart=new Date(now);weekStart.setHours(0,0,0,0);weekStart.setDate(now.getDate()-((now.getDay()+6)%7))
  const weekStartKey=`${weekStart.getFullYear()}-${String(weekStart.getMonth()+1).padStart(2,'0')}-${String(weekStart.getDate()).padStart(2,'0')}`
  const shown = rows.filter((r) => {
    const matchesType=filter==='All activity'||(filter==='Income'?r.type==='income':r.type==='expense')
    if(!matchesType||range==='All time'||!r.date)return matchesType
    if(range==='Day')return r.date===todayKey
    if(range==='Month')return r.date.startsWith(todayKey.slice(0,7))
    if(range==='Year')return r.date.startsWith(todayKey.slice(0,4))
    return r.date>=weekStartKey&&r.date<=todayKey
  })
  const add = async (e) => {
    e.preventDefault(); if (!name.trim() || !Number(amount)) return; setEntryError('')
    const date = localToday()
    try {
      let created
      if (session?.token) created = editingId !== null
        ? await apiRequest(`/expenses/${editingId}`, { method:'PUT', body:JSON.stringify({description:name.trim(),category,amount:Number(amount),date}) })
        : entryType === 'income'
          ? await apiRequest('/incomes', { method: 'POST', body: JSON.stringify({ source: name.trim(), amount: Number(amount), date, note: '' }) })
          : await apiRequest('/expenses', { method: 'POST', body: JSON.stringify({ description: name.trim(), category, amount: Number(amount), date }) })
      const row = entryType === 'income'
        ? { id:created?.id||Date.now(), date:created?.date||date, name: created?.source || name.trim(), category: `Income · ${created?.date || 'Today'}`, amount: Number(amount), type: 'income', icon: '↗' }
        : { id:created?.id||editingId||Date.now(), date:created?.date||date, rawCategory:created?.category||category, name: created?.description || name.trim(), category: `${created?.category || category} · ${created?.date || 'Today'}`, amount: -Number(amount), type: 'expense', icon: '•' }
      setRows(editingId!==null?rows.map((item)=>item.id===editingId?row:item):[row,...rows]); setName(''); setAmount(''); setCategory('Other'); setEditingId(null); setShowForm(false)
      if(session?.token)await onDataChanged?.()
    } catch (error) { setEntryError(error.message) }
  }
  const beginEdit=(row)=>{setEditingId(row.id);setEntryType('expense');setName(row.name);setAmount(Math.abs(row.amount));setCategory(row.rawCategory||row.category.split(' · ')[0]||'Other');setEntryError('');setShowForm(true)}
  const removeExpense=async(row)=>{setEntryError('');try{if(session?.token)await apiRequest(`/expenses/${row.id}`,{method:'DELETE'});setRows(rows.filter((item)=>item.id!==row.id));if(session?.token)await onDataChanged?.()}catch(error){setEntryError(error.message)}}
  const saveBudget=async(e)=>{
    e.preventDefault();setBudgetError('')
    const name=budgetCategory.trim(),limit=Number(budgetLimit),now=new Date(),year=now.getFullYear(),month=now.getMonth()+1
    if(!name||limit<=0){setBudgetError('Enter a category and a monthly limit above zero.');return}
    try{
      if(session?.token){
        const categories=await apiRequest('/categories');setBudgetCategories(categories)
        let category=categories.find((item)=>item.name.toLowerCase()===name.toLowerCase())
        if(!category)category=await apiRequest('/categories',{method:'POST',body:JSON.stringify({name,color:'#10B981'})})
        const saved=await apiRequest('/budgets',{method:'POST',body:JSON.stringify({categoryId:category.id,year,month,limitAmount:limit})})
        setBudgets((items)=>[saved,...items.filter((item)=>item.categoryId!==saved.categoryId)])
      }else{
        const existing=budgets.find((item)=>item.category.toLowerCase()===name.toLowerCase()&&item.year===year&&item.month===month)
        const saved={id:existing?.id||Date.now(),categoryId:existing?.categoryId||name.toLowerCase(),category:name,year,month,limitAmount:limit}
        setBudgets((items)=>[saved,...items.filter((item)=>item.categoryId!==saved.categoryId)])
      }
      setBudgetCategory('');setBudgetLimit('')
    }catch(error){setBudgetError(error.message)}
  }
  return <div className="activity-layout"><div className="activity-summary"><div className="panel activity-summary-card"><div className="summary-icon incoming"><ArrowDownLeft size={18} /></div><span>Income this month</span><strong>{cash(activityIncome)}</strong><small>{liveDashboard?'Recorded this month':'+2.4% from last month'}</small></div><div className="panel activity-summary-card"><div className="summary-icon outgoing"><ArrowUpRight size={18} /></div><span>Expenses this month</span><strong>{cash(activityExpenses)}</strong><small>{liveDashboard?'Recorded this month':'68% of your take-home pay'}</small></div><div className="panel activity-summary-card"><div className="summary-icon saving"><Wallet size={18} /></div><span>Net saved</span><strong>{cash(activitySavings)}</strong><small>{liveDashboard?'Income less expenses':'On track with your plan'}</small></div></div>
    <div className="panel full-activity"><div className="panel-header"><div><div className="section-kicker">YOUR MONEY TRAIL</div><h2>Transactions</h2><p>A clear view of every move.</p></div><div className="activity-actions"><button className="select-control" onClick={() => setFilter(filter === 'All activity' ? 'Income' : filter === 'Income' ? 'Expenses' : 'All activity')}>{filter}<ChevronDown size={14} /></button><button className="select-control" onClick={() => setRange(rangeOptions[(rangeOptions.indexOf(range)+1)%rangeOptions.length])}>{range}<ChevronDown size={14} /></button><button className="button-primary add-button" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add entry</button></div></div>
      {showForm && <form className="quick-entry" onSubmit={add}>
        {editingId===null?<div className="entry-type"><button type="button" className={entryType==='expense'?'selected':''} onClick={()=>setEntryType('expense')}>Expense</button><button type="button" className={entryType==='income'?'selected':''} onClick={()=>setEntryType('income')}>Income</button></div>:<span className="editing-label">EDIT EXPENSE</span>}
        <label className="field"><span>{entryType==='income'?'Income source':'Expense name'}</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder={entryType==='income'?'e.g. Freelance project':'e.g. Coffee'} autoFocus /></label>
        {entryType==='expense'&&<label className="field"><span>Category</span><input value={category} onChange={(e)=>setCategory(e.target.value)} placeholder="e.g. Food & dining"/></label>}
        <label className="field"><span>Amount</span><div className="input-prefix"><b>₹</b><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" placeholder="0" /></div></label>
        <button className="button-primary add-button" type="submit">{editingId===null?'Save entry':'Save changes'}</button><button className="icon-button" type="button" onClick={() => {setShowForm(false);setEditingId(null);setEntryError('')}} aria-label="Close"><X size={16} /></button>{entryError&&<div className="entry-error">{entryError}</div>}
      </form>}
      {!showForm&&entryError&&<div className="entry-error">{entryError}</div>}
      <div className="table-wrap"><table><thead><tr><th>DESCRIPTION</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th><th>MANAGE</th></tr></thead><tbody>{shown.map((r, i) => <tr key={`${r.id}-${r.name}`}><td><span className={`table-icon ${r.type}`}>{r.type === 'income' ? <ArrowDownLeft size={15} /> : <CreditCard size={15} />}</span><strong>{r.name}</strong></td><td>{r.category.split(' · ')[0]}</td><td>{r.date?new Date(`${r.date}T12:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—'}</td><td className={r.type === 'income' ? 'income-amount' : ''}>{r.amount > 0 ? '+' : '−'}{cash(Math.abs(r.amount))}</td><td><span className="paid-tag"><i /> Completed</span></td><td>{r.type==='expense'&&<span className="row-actions"><button type="button" onClick={()=>beginEdit(r)}>Edit</button><button type="button" onClick={()=>removeExpense(r)}>Delete</button></span>}</td></tr>)}</tbody></table></div><div className="table-foot"><span>Showing {shown.length} transactions</span><button className="text-link" onClick={() => {setFilter('All activity');setRange('All time')}}>Reset filters <ArrowRight size={13} /></button></div>
    </div>
    <section className="panel budget-panel"><div className="panel-header"><div><div className="section-kicker">MONTHLY GUARDRAILS</div><h2>Category budgets</h2><p>Set a limit and see how it compares with recorded spending.</p></div></div><form className="budget-entry" onSubmit={saveBudget}><label className="field"><span>Category</span><input value={budgetCategory} onChange={(e)=>setBudgetCategory(e.target.value)} placeholder="e.g. Food & dining" required/></label><label className="field"><span>Monthly limit</span><div className="input-prefix"><b>₹</b><input type="number" min="1" value={budgetLimit} onChange={(e)=>setBudgetLimit(e.target.value)} placeholder="0" required/></div></label><button className="button-primary add-button" type="submit">Save budget</button></form>{budgetError&&<div className="entry-error">{budgetError}</div>}<div className="budget-list">{budgets.length?budgets.map((budget)=>{const periodKey=`${budget.year}-${String(budget.month).padStart(2,'0')}`;const spent=rows.filter((row)=>row.type==='expense'&&(row.date||'').startsWith(periodKey)&&(row.rawCategory||row.category.split(' · ')[0]).toLowerCase()===budget.category.toLowerCase()).reduce((sum,row)=>sum+Math.abs(Number(row.amount)),0);const pct=Math.min(100,spent/Number(budget.limitAmount||1)*100);return <div className="budget-item" key={`${budget.categoryId}-${budget.year}-${budget.month}`}><div className="budget-item-copy"><strong>{budget.category}</strong><span>{cash(spent)} of {cash(budget.limitAmount)}</span></div><div className="budget-track"><i className={spent>Number(budget.limitAmount)?'over-budget':''} style={{width:`${pct}%`}}/></div></div>}):<div className="category-empty">{session?'Add a monthly budget for any spending category.':'Demo budgets are temporary; sign in to save your budgets to an account.'}</div>}</div></section>
    <CreditCardSection session={session} onDataChanged={onDataChanged} />
    <p className="page-disclaimer"><ShieldCheck size={14} /> {session?'Transactions and card details use records entered in your account. SpendWise does not connect to a bank.':'Sample account data for demonstration. No actual bank or credit card is connected.'}</p>
  </div>
}

function GoalsPage({ session }) {
  const [goals, setGoals] = useState(session ? [] : demo.goals)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [goalError, setGoalError] = useState('')
  useEffect(() => {
    if (!session?.token) { setGoals(demo.goals); return }
    apiRequest('/goals').then((items) => setGoals(items.map((g, i) => ({ id:g.id, name:g.name, saved:Number(g.savedAmount), target:Number(g.targetAmount), targetDate:g.targetDate, due:g.targetDate || 'Set a date', color:['mint','blue','violet'][i%3] })))).catch(() => setGoals([]))
  }, [session?.token])
  const addGoal = async (e) => { e.preventDefault(); if (!name.trim() || Number(target) <= 0) return; setGoalError(''); try { let g;if(session?.token)g=await apiRequest('/goals',{method:'POST',body:JSON.stringify({name:name.trim(),targetAmount:Number(target),savedAmount:0,targetDate:targetDate||null})});const item={id:g?.id,name:g?.name||name.trim(),saved:Number(g?.savedAmount||0),target:Number(g?.targetAmount||target),targetDate:g?.targetDate||targetDate||null,due:g?.targetDate||targetDate||'Set a date',color:['mint','blue','violet'][goals.length%3]};setGoals([...goals,item]);setName('');setTarget('');setTargetDate('');setAdding(false)}catch(error){setGoalError(error.message)} }
  const contribute = async (index) => { const goal=goals[index];const next=Math.min(goal.target,goal.saved+5000);try{if(session?.token)await apiRequest(`/goals/${goal.id}`,{method:'PUT',body:JSON.stringify({name:goal.name,targetAmount:goal.target,savedAmount:next,targetDate:goal.targetDate||null})});setGoals(goals.map((g,j)=>j===index?{...g,saved:next}:g))}catch(error){setGoalError(error.message)} }
  return <div className="goals-page"><div className="goals-banner panel"><div className="goal-banner-copy"><span className="section-kicker">THE FUTURE, IN FOCUS</span><h2>Every goal starts<br />with <em>one good choice.</em></h2><p>You have <strong>{cash(goals.reduce((sum, g) => sum + g.saved, 0))}</strong> saved across {goals.length} goals. Keep going—future you is already grateful.</p></div><div className="goal-banner-visual"><div className="goal-orbit orbit-one" /><div className="goal-orbit orbit-two" /><div className="goal-center"><Sparkles size={23} /></div><span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" /><span className="orbit-dot dot-three" /></div></div>
    <div className="goals-heading"><div><div className="section-kicker">YOUR SAVINGS GOALS</div><h2>Made for what matters.</h2></div><button className="button-primary add-button" onClick={() => setAdding(!adding)}><Plus size={15} /> New goal</button></div>
    {adding && <form className="quick-entry goal-entry" onSubmit={addGoal}><label className="field"><span>Goal name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Home deposit" autoFocus /></label><label className="field"><span>Target amount</span><div className="input-prefix"><b>₹</b><input value={target} onChange={(e) => setTarget(e.target.value)} type="number" min="1" placeholder="0" /></div></label><label className="field"><span>Target date</span><input type="date" value={targetDate} onChange={(e)=>setTargetDate(e.target.value)}/></label><button className="button-primary add-button" type="submit">Create goal</button></form>}{goalError&&<div className="entry-error">{goalError}</div>}
    <div className="goal-grid">{goals.map((goal, i) => { const pct = Math.min(100, Math.round(goal.saved / goal.target * 100)); return <motion.article className={`panel goal-card ${goal.color}`} key={`${goal.name}-${i}`} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .24 }} transition={{ delay: i * .07, duration: .48 }}><div className="goal-card-top"><span className={`goal-icon ${goal.color}`}><Goal size={17} /></span></div><div className="goal-ring" style={{ '--goal-angle': `${pct * 3.6}deg` }}><div className="goal-ring-center"><strong>{pct}%</strong><span>saved</span></div></div><div className="goal-card-copy"><h3>{goal.name}</h3><p><strong>{cash(goal.saved)}</strong> of {cash(goal.target)}</p></div><div className="goal-linear"><i style={{ width: `${pct}%` }} /></div><div className="goal-footer"><span><CalendarDays size={13} /> Target {goal.due}</span><button className="contribute" onClick={() => contribute(i)}><Plus size={13} /> Add ₹5k</button></div></motion.article> })}</div>
    <div className="goal-note"><div className="insight-icon small"><Lightbulb size={14} /></div><span>Small, regular contributions can help your goals feel more achievable.</span></div>
    <p className="page-disclaimer"><ShieldCheck size={14} /> {session?'Goal progress is saved to your account.':'Demo goal progress is temporary and resets when the app reloads.'}</p>
  </div>
}

const titleByPage = { overview: 'Good morning, Aarav', simulator: 'Purchase simulator', emi: 'EMI planner', activity: 'Your activity', goals: 'Savings goals' }

export default function App() {
  const reducedMotion = useReducedMotion()
  const [page, setPage] = useState('overview')
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 680)
  const [light, setLight] = useState(false)
  const [notifications, setNotifications] = useState(false)
  const [accountOpen, setAccountOpen] = useState(() => new URLSearchParams(window.location.search).has('reset'))
  const [session, setCurrentSession] = useState(() => getSession())
  const [liveDashboard, setLiveDashboard] = useState(null)
  const [savedSimulations, setSavedSimulations] = useState([])
  const [demoEmiPlans,setDemoEmiPlans]=useState([])
  const [toast, setToast] = useState('')
  const title = page === 'overview' ? 'Financial command space' : titleByPage[page] || 'Your finances'
  useEffect(() => {
    if (!session?.token) { setLiveDashboard(null); return }
    apiRequest('/dashboard').then(setLiveDashboard).catch(() => setLiveDashboard(null))
  }, [session?.token])
  useEffect(() => {
    if (!session?.token) { setSavedSimulations([]); return }
    apiRequest('/simulations').then(setSavedSimulations).catch(() => setSavedSimulations([]))
  }, [session?.token])
  const refreshDashboard = async () => {
    if (!session?.token) return
    try { setLiveDashboard(await apiRequest('/dashboard')) } catch { setLiveDashboard(null) }
  }
  const handleSave = (item) => {
    setSavedSimulations((list) => [item, ...list]); setToast(session ? 'Saving simulation to your account…' : 'Simulation saved in this session')
    if (session?.token) {
      const body = { product:item.product, price:Number(item.price), currentBalance:Number(item.balance), emergencySavings:Number(item.emergencySavings), monthlyIncome:Number(item.income), monthlyExpenses:Number(item.expenses), existingEmi:Number(item.emi), creditObligations:Number(item.credit), monthsUntil:Number(item.monthsUntil) }
      apiRequest('/simulations', { method:'POST', body:JSON.stringify(body) }).then((saved) => { setSavedSimulations((list)=>list.map((row)=>row.id===item.id?saved:row)); setToast('Simulation saved to your account') }).catch(() => setToast('Simulation saved in this session'))
    }
    window.setTimeout(() => setToast(''), 2600)
  }
  return <div className={`app-shell ${light ? 'light-mode' : ''}`}>
    <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} light={light} setLight={setLight} session={session} onAccount={() => setAccountOpen(true)} />
    <main className="main-area"><Header page={page} title={title} notifications={notifications} onNotify={() => setNotifications(!notifications)} onAccount={() => setAccountOpen(true)} session={session} />
      <div className="page-content"><AnimatePresence mode="wait"><motion.div key={page} className="page-motion" initial={reducedMotion ? false : { opacity: 0, y: 22, rotateX: 1.4, scale: .99 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, rotateX: -1.2, scale: .99 }} transition={{ duration: reducedMotion ? 0 : .38, ease: [.2, .8, .2, 1] }}>
        {page === 'overview' && <Overview setPage={setPage} savedSimulations={savedSimulations} liveDashboard={liveDashboard} session={session} />}
        {page === 'simulator' && <Simulator onSave={handleSave} profile={liveDashboard?.profile ? { ...liveDashboard.profile, totalMonthlyEmi:liveDashboard.totalMonthlyEmi } : null} />}
        {page === 'emi' && <EmiPlanner session={session} onDataChanged={refreshDashboard} demoPlans={demoEmiPlans} onDemoPlansChange={setDemoEmiPlans} />}
        {page === 'activity' && <ActivityPage session={session} liveDashboard={liveDashboard} onDataChanged={refreshDashboard} />}
        {page === 'goals' && <GoalsPage session={session} />}
      </motion.div></AnimatePresence></div>
      <footer className="app-footer"><span>© 2026 SpendWise Financial Technologies</span><span><ShieldCheck size={13} /> Your financial data is personal</span><span>Built for better decisions <span className="footer-heart">♥</span></span></footer>
    </main>
    {toast && <motion.div className="toast-message" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><Check size={16} />{toast}</motion.div>}
    <button className="mobile-menu" aria-label="Open navigation" onClick={() => setCollapsed(!collapsed)}><Menu size={19} /></button>
    {accountOpen && <AccountDialog session={session} resetToken={new URLSearchParams(window.location.search).get('reset')} onClose={() => setAccountOpen(false)} onAuthenticated={async (signedIn) => { setSession(signedIn); setCurrentSession(signedIn); try { setLiveDashboard(await apiRequest('/dashboard')) } catch { setLiveDashboard(null) } }} onLogout={() => { setSession(null); setCurrentSession(null); setLiveDashboard(null); setAccountOpen(false) }} onProfileUpdated={async () => { try { setLiveDashboard(await apiRequest('/dashboard')) } catch { setLiveDashboard(null) } }} />}
  </div>
}
