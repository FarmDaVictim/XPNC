import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Landing from './pages/Landing'
import MapView from './pages/MapView'
import Dashboard from './pages/Dashboard'
import QuestsList from './pages/QuestsList'
import NFTBadges from './pages/NFTBadges'
import ImpactJournal from './pages/ImpactJournal'
import Wallet from './pages/Wallet'
import Settings from './pages/Settings'
import Admin from './pages/Admin'

function App() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'
  const isLanding = location.pathname === '/'

  return (
    <div className="flex min-h-screen bg-[var(--color-app-bg)] transition-colors duration-300">
      {!isAdmin && !isLanding && <Sidebar />}
      <main className={`flex-1 min-h-0 flex flex-col ${isAdmin ? 'max-w-none' : ''}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/map" element={<div key="map" className="flex-1 flex flex-col page-enter"><MapView /></div>} />
          <Route path="/dashboard" element={<div key="dashboard" className="page-enter"><Dashboard /></div>} />
          <Route path="/quests" element={<div key="quests" className="page-enter"><QuestsList /></div>} />
          <Route path="/badges" element={<div key="badges" className="page-enter"><NFTBadges /></div>} />
          <Route path="/journal" element={<div key="journal" className="page-enter"><ImpactJournal /></div>} />
          <Route path="/wallet" element={<div key="wallet" className="page-enter"><Wallet /></div>} />
          <Route path="/settings" element={<div key="settings" className="page-enter"><Settings /></div>} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
