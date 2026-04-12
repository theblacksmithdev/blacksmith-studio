import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { SetupWizard } from '@/components/setup/setup-wizard'

const SETUP_COMPLETE_KEY = 'blacksmith-studio:setup-complete'

// Restore zoom level on startup
const savedZoom = localStorage.getItem('studio-zoom-level')
if (savedZoom) {
  const level = parseFloat(savedZoom)
  if (!isNaN(level)) window.electronAPI?.setZoomLevel(level)
}

export function App() {
  const [setupDone, setSetupDone] = useState(
    () => localStorage.getItem(SETUP_COMPLETE_KEY) === '1'
  )

  const handleSetupComplete = () => {
    localStorage.setItem(SETUP_COMPLETE_KEY, '1')
    setSetupDone(true)
  }

  if (!setupDone) {
    return <SetupWizard onComplete={handleSetupComplete} />
  }

  return <RouterProvider router={router} />
}
