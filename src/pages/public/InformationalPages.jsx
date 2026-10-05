import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import './InformationalPages.css'

function InfoPage({ title, eyebrow, introduction, children }) {
  useDocumentTitle(title)
  return (
    <div className="info-page">
      <header className="info-page__header">
        <span className="info-page__eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{introduction}</p>
      </header>
      <div className="info-page__content">{children}</div>
    </div>
  )
}

function InfoSection({ title, children }) {
  return <section className="info-section"><h2>{title}</h2>{children}</section>
}

export function AboutPage() {
  return (
    <InfoPage title="About SeekersStop" eyebrow="ABOUT" introduction="SeekersStop brings job seekers and recruiters together through job discovery, applications, and recruiting tools.">
      <Card className="info-card">
        <InfoSection title="For job seekers">
          <p>Browse available jobs, search by title, location, or experience, and open a listing to review its details. A job seeker can create a profile, keep a PDF resume, apply to eligible jobs, and review application statuses in their account.</p>
        </InfoSection>
        <InfoSection title="For recruiters">
          <p>Recruiters can create a recruiter profile and company information, publish and manage job listings, and review applications associated with their recruiting workspace.</p>
        </InfoSection>
        <InfoSection title="A shared workspace">
          <p>Registration assigns an account role. The role determines which seeker or recruiter workspace is available after sign-in.</p>
          <div className="info-page__actions"><Button as={Link} to="/jobs">Browse jobs</Button><Button as={Link} to="/register" variant="secondary">Create an account</Button></div>
        </InfoSection>
      </Card>
    </InfoPage>
  )
}

export function HowItWorksPage() {
  return (
    <InfoPage title="How it works" eyebrow="GETTING STARTED" introduction="Choose the path that matches your role and use the tools available in that workspace.">
      <div className="info-card-grid">
        <Card className="info-card">
          <InfoSection title="For job seekers">
            <ol className="info-steps">
              <li>Create an account and select the Job Seeker role.</li>
              <li>Complete your profile and add a PDF resume before applying.</li>
              <li>Search jobs by title, location, or experience and review job details.</li>
              <li>Apply to an eligible job and follow its status in My Applications.</li>
            </ol>
          </InfoSection>
          <Button as={Link} to="/jobs">Find jobs</Button>
        </Card>
        <Card className="info-card">
          <InfoSection title="For recruiters">
            <ol className="info-steps">
              <li>Create an account and select the Recruiter role.</li>
              <li>Complete recruiter profile and company information.</li>
              <li>Post a job, then manage its listing from the recruiter workspace.</li>
              <li>Review applications and update their supported statuses.</li>
            </ol>
          </InfoSection>
          <Button as={Link} to="/register" variant="secondary">Register</Button>
        </Card>
      </div>
    </InfoPage>
  )
}

const helpGroups = [
  {
    title: 'Job seekers',
    items: [
      ['How do I find a job?', 'Use Find Jobs to search by title, location, and experience. Open a result to review the job details.'],
      ['Why can’t I apply?', 'Applying requires a signed-in Job Seeker account with a completed profile. The backend also checks whether a job is eligible and whether you have already applied.'],
      ['Where can I follow an application?', 'Open My Applications in the seeker workspace. The application status is supplied by the backend.'],
      ['How do I manage my resume?', 'Create your seeker profile with a PDF resume, then use the Resume page to view, download, or replace it.'],
    ],
  },
  {
    title: 'Recruiters',
    items: [
      ['How do I post a job?', 'Set up your recruiter profile and company information, then use Post Job in the recruiter workspace.'],
      ['Where are my job listings?', 'Manage Jobs lists jobs returned for your recruiter account, including active and inactive listings.'],
      ['How do I review applications?', 'Open Applications in the recruiter workspace to review returned application information and choose a supported status.'],
    ],
  },
  {
    title: 'Account and access',
    items: [
      ['Why can’t I open a seeker or recruiter page?', 'Workspace pages are limited by the role selected for the signed-in account. Sign in with an account created for the appropriate role.'],
      ['How do I sign out?', 'Use Logout in the seeker or recruiter navigation.'],
    ],
  },
]

export function HelpPage() {
  return (
    <InfoPage title="Help center" eyebrow="HELP" introduction="Find guidance for common job search, recruiting, and account tasks.">
      <div className="info-card-grid info-card-grid--stacked">
        {helpGroups.map((group) => (
          <Card className="info-card" key={group.title}>
            <h2>{group.title}</h2>
            <div className="info-faq-list">
              {group.items.map(([question, answer]) => (
                <details className="info-faq" key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </Card>
        ))}
        <Card className="info-card info-support-card">
          <h2>Need more help?</h2>
          <p>Contact SeekersStop Support</p>
          <a href="mailto:help.seekersstop@gmail.com">help.seekersstop@gmail.com</a>
        </Card>
      </div>
    </InfoPage>
  )
}

export function ContactPage() {
  return (
    <InfoPage title="Contact and support" eyebrow="CONTACT" introduction="Use these in-app resources to find help with SeekersStop features.">
      <Card className="info-card">
        <InfoSection title="Get help with a task">
          <p>For job search, applications, resumes, recruiter profiles, companies, or job listings, start with the Help Center and the relevant page in your account.</p>
          <div className="info-page__actions"><Button as={Link} to="/help">Visit the Help Center</Button><Button as={Link} to="/jobs" variant="secondary">Browse jobs</Button></div>
        </InfoSection>
        <InfoSection title="No contact form is available here">
          <p>This page does not send a support request. SeekersStop currently provides the in-app guidance and account pages linked above; no support email or phone contact is listed here.</p>
        </InfoSection>
      </Card>
    </InfoPage>
  )
}

export function PrivacyPage() {
  return (
    <InfoPage title="Privacy overview" eyebrow="PRIVACY" introduction="This overview describes information used by the SeekersStop features available in this application.">
      <Card className="info-card">
        <InfoSection title="Information used by the service">
          <p>Account information supports sign-in and role-specific access. Job seeker profile details and resumes support the seeker profile and application workflow. Recruiter profile, company, and job information support listing and recruiting workflows. Applications contain the application and job information returned by the service.</p>
        </InfoSection>
        <InfoSection title="How information appears in the product">
          <p>The application displays information needed by its features and by the account’s role. Job listings are available for browsing; account and workspace pages use authenticated backend data.</p>
        </InfoSection>
        <InfoSection title="Keep information current">
          <p>Use the profile and company pages to review or update information available to your account. This page does not describe retention periods, deletion procedures, or legal rights that are not provided by the application.</p>
        </InfoSection>
      </Card>
    </InfoPage>
  )
}

export function TermsPage() {
  return (
    <InfoPage title="Terms of use" eyebrow="TERMS" introduction="These concise product terms describe expected use of the SeekersStop application.">
      <Card className="info-card">
        <InfoSection title="Use your account appropriately">
          <p>Provide accurate information for your account and use the seeker or recruiter workspace associated with your selected role. Keep your sign-in credentials private.</p>
        </InfoSection>
        <InfoSection title="Use job and application features honestly">
          <p>Job seekers should submit applications for their own use and keep profile information current. Recruiters should provide accurate company and job listing information and review applications through the recruiting workspace.</p>
        </InfoSection>
        <InfoSection title="Respect access and service rules">
          <p>Do not attempt to access another account’s information or bypass role-based access. Job and application actions remain subject to the validation and rules enforced by the service.</p>
        </InfoSection>
        <InfoSection title="Product information">
          <p>These terms summarize the current product experience and do not promise a particular hiring outcome or service availability.</p>
        </InfoSection>
      </Card>
    </InfoPage>
  )
}
