import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import { NavProvider } from './context/NavContext.jsx'
import NavDrawer from './components/NavDrawer.jsx'
import AndroidIntentGuard from './components/AndroidIntentGuard.jsx'
import Dashboard from './pages/Dashboard.jsx'
import About from './pages/About.jsx'
import Settings from './pages/Settings.jsx'
import Placeholder from './pages/Placeholder.jsx'
import SafeList from './pages/SafeList.jsx'
import ThreatHeatmap from './pages/ThreatHeatmap.jsx'
import RiskChart from './pages/RiskChart.jsx'
import HistoryScan from './pages/HistoryScan.jsx'

function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <NavDrawer />
      <AndroidIntentGuard />
      <Routes>
        <Route path="/"            element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/about"       element={<About />} />
        <Route path="/settings"    element={<Settings />} />
        <Route path="/saved"       element={<Placeholder title="Saved links" />} />
        <Route path="/history"     element={<HistoryScan />} />
        <Route path="/safelist"    element={<SafeList />} />
        <Route path="/heatmap"     element={<ThreatHeatmap />} />
        <Route path="/risk-chart"  element={<RiskChart />} />
        <Route path="*"            element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <NavProvider>
          <Layout />
        </NavProvider>
      </HashRouter>
    </AppProvider>
  )
}
