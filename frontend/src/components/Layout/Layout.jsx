import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useSettings } from '../../context/SettingsContext'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { settings } = useSettings()

  // When compact sidebar is enabled, override open state to collapsed
  const effectiveOpen = settings.compactSidebar ? false : sidebarOpen

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900 bg-grid">
      <Sidebar open={effectiveOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(v => !v)} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
