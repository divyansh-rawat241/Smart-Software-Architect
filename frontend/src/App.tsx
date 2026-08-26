import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { RequirementWizardPage } from './pages/RequirementWizardPage'
import { ArchitectureStudioPage } from './pages/ArchitectureStudioPage'
import { ComparisonPage } from './pages/ComparisonPage'
import { BlastRadiusPage } from './pages/BlastRadiusPage'
import { DiagramsPage } from './pages/DiagramsPage'
import { DocsPage } from './pages/DocsPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wizard" element={<RequirementWizardPage />} />
        <Route path="/architecture" element={<ArchitectureStudioPage />} />
        <Route path="/comparison" element={<ComparisonPage />} />
        <Route path="/blast-radius" element={<BlastRadiusPage />} />
        <Route path="/diagrams" element={<DiagramsPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
