import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import HomePage from '@/pages/HomePage'
import SetupPage from '@/pages/SetupPage'
import TrainingPage from '@/pages/TrainingPage'
import ResultsPage from '@/pages/ResultsPage'
import StatsPage from '@/pages/StatsPage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
