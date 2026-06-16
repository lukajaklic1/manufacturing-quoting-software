import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './hooks/useAuth'
import { LanguageProvider } from './hooks/useLanguage'
import { Toaster } from './components/ui/Toast'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import CustomersPage from './pages/CustomersPage'
import QuotesPage from './pages/QuotesPage'
import QuoteFormPage from './pages/QuoteFormPage'
import QuoteDetailPage from './pages/QuoteDetailPage'
import MachinesPage from './pages/MachinesPage'
import MachineFormPage from './pages/MachineFormPage'
import LaborListPage from './pages/LaborListPage'
import LaborFormPage from './pages/LaborFormPage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AcceptInvitePage from './pages/AcceptInvitePage'

const queryClient = new QueryClient()

function App({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
          <Toaster />
          <Routes>
            {/* Public */}
            <Route path="/"            element={<LandingPage />} />
            <Route path="/login"       element={<LoginPage />} />
            <Route path="/register"    element={<RegisterPage />} />
            <Route path="/onboarding"  element={<OnboardingPage />} />
            <Route path="/privacy"          element={<PrivacyPage />} />
            <Route path="/terms"            element={<TermsPage />} />
            <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
            <Route path="/reset-password"   element={<ResetPasswordPage />} />
            <Route path="/accept-invite"    element={<AcceptInvitePage />} />

            {/* Protected app */}
            <Route path="/dashboard"        element={<App><DashboardPage /></App>} />
            <Route path="/quotes"           element={<App><QuotesPage /></App>} />
            <Route path="/quotes/new"       element={<App><QuoteFormPage /></App>} />
            <Route path="/quotes/:id"       element={<App><QuoteDetailPage /></App>} />
            <Route path="/quotes/:id/edit"  element={<App><QuoteFormPage /></App>} />
            <Route path="/customers"        element={<App><CustomersPage /></App>} />
            <Route path="/machines"         element={<App><MachinesPage /></App>} />
            <Route path="/machines/new"     element={<App><MachineFormPage /></App>} />
            <Route path="/machines/:id/edit" element={<App><MachineFormPage /></App>} />
            <Route path="/labor"            element={<App><LaborListPage /></App>} />
            <Route path="/labor/new"        element={<App><LaborFormPage /></App>} />
            <Route path="/labor/:id/edit"   element={<App><LaborFormPage /></App>} />
            <Route path="/users"            element={<App><UsersPage /></App>} />
            <Route path="/settings"         element={<App><SettingsPage /></App>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
