# SeekersStop Frontend

The React and Vite frontend for the SeekersStop job portal. It provides public job browsing and role-specific workspaces for job seekers and recruiters.

## Overview

The frontend communicates with the SeekersStop Spring Boot backend through REST APIs. It supports two account roles, `JOB_SEEKER` and `RECRUITER`, with separate protected routes and workspaces.

## Features

### Authentication

- Register with a selected account role and log in.
- Store the login JWT in browser local storage and attach it to API requests.
- Restrict workspace routes by authentication and account role.
- Log out by clearing the locally stored token.

### Job seeker

- View a dashboard and browse, filter, and paginate job listings.
- View job details and apply when signed in with the `JOB_SEEKER` role.
- Review application status, view application details, and withdraw pending applications.
- View and update a seeker profile, and upload or download a CV.

### Recruiter

- View a recruiter dashboard and manage recruiter profile and company information.
- Create, view, activate, deactivate, and edit job listings.
- Review applications, update application status, and view applicant resumes.

### Public pages

- Browse jobs and job details without opening a workspace.
- View the home, About, Help, Contact, How It Works, Privacy, and Terms pages.

## Tech Stack

| Technology | Version / use |
| --- | --- |
| React | `^19.2.8` |
| Vite | `^8.3.0` |
| JavaScript | ES modules and JSX |
| React Router DOM | `^7.18.4` |
| Axios | `^1.20.0` |
| CSS | Application and component styling |
| ESLint | `^10.10.0`, with JavaScript, React Hooks, and React Refresh rules |

## Project Structure

```text
public/         Static files served by Vite
index.html      HTML entry point
src/
|-- assets/       Images and static assets
|-- components/   Shared UI components
|-- context/      Authentication context and provider
|-- hooks/        Shared React hooks
|-- layouts/      Public, seeker, and recruiter layouts
|-- pages/
|   |-- public/   Public and authentication pages
|   |-- seeker/   Job seeker workspace pages
|   `-- recruiter/ Recruiter workspace pages
|-- routes/       Route definitions and access guards
|-- services/     Axios API client and backend service functions
|-- utils/        Token, role, status, and API error helpers
|-- App.jsx
|-- App.css
|-- index.css
`-- main.jsx
```

The repository root also contains `vite.config.js`, `eslint.config.js`, `package.json`, `package-lock.json`, and `.env.example`.

## Authentication & Authorization

`AuthProvider` wraps the application. After login, the returned JWT is stored in local storage under the `seekersstop_token` key. The frontend reads the token payload to obtain the username (`sub`) and role; it uses those claims for client-side navigation and access decisions.

The shared Axios client adds `Authorization: Bearer <token>` to requests when a token is stored. If an authenticated request receives HTTP 401, it clears the token and notifies the auth context. `ProtectedRoute` redirects signed-out users to login, while role routes direct authenticated users to the workspace matching their role. Backend authorization remains authoritative.

## Backend Integration

The API base URL is configured with `VITE_API_BASE_URL`. The frontend currently references these REST endpoints:

| Area | Methods and paths |
| --- | --- |
| Authentication | `POST /auth/register`, `POST /auth/login` |
| Jobs | `GET /jobs` (filters and pagination), `GET /jobs/{id}`, `POST /jobs`, `PUT /jobs/{id}`, `PUT /jobs/active/{id}`, `DELETE /jobs/deactive/{id}`, `GET /jobs/my` |
| Applications | `GET /applications/my`, `POST /applications`, `GET /applications/{applicationId}`, `PATCH /applications/{applicationId}/withdraw`, `GET /applications/recruiter`, `PATCH /applications/{applicationId}/status`, `GET /applications/{applicationId}/resume` |
| Job seeker profile and CV | `POST /jobseeker/profile`, `GET /jobseeker/profile`, `PUT /jobseeker/profile`, `GET /jobseeker/cv`, `PUT /jobseeker/cv` |
| Recruiter profile | `POST /recruiter/profile`, `GET /recruiter/profile`, `PUT /recruiter/profile` |
| Company | `POST /company`, `GET /company`, `PUT /company` |

## Environment Configuration

The frontend requires `VITE_API_BASE_URL`; the Axios client throws an error when it is unset. The checked-in `.env.example` contains a placeholder only.

For local development, create `.env.local` in this directory and set the URL for your running backend, for example:

```dotenv
VITE_API_BASE_URL=http://localhost:8081
```

For a deployed build, set `VITE_API_BASE_URL` to the appropriate backend URL in the build environment. Vite embeds this value at build time.

## Installation

From this directory, install the locked dependencies:

```bash
npm ci
```

Copy `.env.example` to `.env.local` and replace its placeholder with the backend URL for your environment.

## Running Locally

Start the Vite development server:

```bash
npm run dev
```

## Build

Create the production frontend bundle in `dist/`:

```bash
npm run build
```

Preview a local production build with:

```bash
npm run preview
```

## Code Quality

Run the configured ESLint checks with:

```bash
npm run lint
```

The lint configuration checks JavaScript and JSX, including React Hooks and React Refresh rules. `package.json` does not define a test script.

## Deployment

The Vite build outputs static files in `dist/`, which can be served by a static hosting provider. No provider-specific deployment configuration or deployed URL is present in this repository. Set `VITE_API_BASE_URL` in the production build environment before building; the API URL is embedded in the generated assets.

## Important Security Notes

- Do not commit `.env` files or other environment-specific configuration. `.gitignore` excludes `.env*` files while allowing `.env.example`.
- Do not put credentials, API secrets, JWT secrets, or private tokens in the README or `.env.example`.
- Keep `.env.example` limited to placeholder values.

## Current Project Status

The repository contains implemented public pages, authentication, job seeker and recruiter routes, and service functions for the backend workflows listed above. The frontend requires a separately running or deployed backend URL. This README makes no claim about production readiness or deployment status.

## Future Improvements

Potential follow-up work, not represented as implemented features:

- Add automated frontend component and integration tests.
- Continue improving responsive behavior and accessibility across pages.
