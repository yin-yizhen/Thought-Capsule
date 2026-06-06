import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Input from './pages/Input.tsx'
import Reminder from './pages/Reminder.tsx'
import Settings from './pages/Settings.tsx'
import TodayEntries from './pages/TodayEntries.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Input />} />
        <Route path="/reminder" element={<Reminder />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/today" element={<TodayEntries />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
