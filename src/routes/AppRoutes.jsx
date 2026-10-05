import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout.jsx'
import RecruiterLayout from '../layouts/RecruiterLayout.jsx'
import SeekerLayout from '../layouts/SeekerLayout.jsx'
import HomePage from '../pages/public/HomePage.jsx'
import LoginPage from '../pages/public/LoginPage.jsx'
import RegisterPage from '../pages/public/RegisterPage.jsx'
import SeekerJobsPage from '../pages/seeker/JobsPage.jsx'
import JobDetailsPage from '../pages/public/JobDetailsPage.jsx'
import NotFoundPage from '../pages/public/NotFoundPage.jsx'
import { AboutPage, HelpPage, ContactPage, HowItWorksPage, PrivacyPage, TermsPage } from '../pages/public/InformationalPages.jsx'
import SeekerDashboardPage from '../pages/seeker/SeekerDashboardPage.jsx'
import SeekerApplicationsPage from '../pages/seeker/ApplicationsPage.jsx'
import ApplicationDetailsPage from '../pages/seeker/ApplicationDetailsPage.jsx'
import SeekerProfilePage from '../pages/seeker/ProfilePage.jsx'
import SeekerResumePage from '../pages/seeker/ResumePage.jsx'
import RecruiterDashboardPage from '../pages/recruiter/RecruiterDashboardPage.jsx'
import RecruiterJobsPage from '../pages/recruiter/JobsPage.jsx'
import RecruiterApplicationsPage from '../pages/recruiter/ApplicationsPage.jsx'
import RecruiterProfilePage from '../pages/recruiter/ProfilePage.jsx'
import CompanyPage from '../pages/recruiter/CompanyPage.jsx'
import RecruiterPostJobPage from '../pages/recruiter/PostJobPage.jsx'
import { ProtectedRoute, RoleRoute } from './ProtectedRoute.jsx'
import { ROLES } from '../utils/roles.js'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<SeekerJobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute role={ROLES.JOB_SEEKER} />}>
            <Route path="/seeker" element={<SeekerLayout />}>
              <Route index element={<SeekerDashboardPage />} />
              <Route path="dashboard" element={<SeekerDashboardPage />} />
              <Route path="jobs" element={<SeekerJobsPage />} />
              <Route path="applications" element={<SeekerApplicationsPage />} />
              <Route path="applications/:applicationId" element={<ApplicationDetailsPage />} />
              <Route path="profile" element={<SeekerProfilePage />} />
              <Route path="resume" element={<SeekerResumePage />} />
            </Route>
          </Route>
          <Route element={<RoleRoute role={ROLES.RECRUITER} />}>
            <Route path="/recruiter" element={<RecruiterLayout />}>
              <Route index element={<RecruiterDashboardPage />} />
              <Route path="dashboard" element={<RecruiterDashboardPage />} />
              <Route path="jobs" element={<RecruiterJobsPage />} />
              <Route path="jobs/new" element={<RecruiterPostJobPage />} />
              <Route path="applications" element={<RecruiterApplicationsPage />} />
              <Route path="profile" element={<RecruiterProfilePage />} />
              <Route path="company" element={<CompanyPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
