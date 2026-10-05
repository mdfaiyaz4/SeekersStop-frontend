export const ROLES = Object.freeze({
  JOB_SEEKER: 'JOB_SEEKER',
  RECRUITER: 'RECRUITER',
})

export function getRoleHome(role) {
  if (role === ROLES.JOB_SEEKER) return '/seeker'
  if (role === ROLES.RECRUITER) return '/recruiter'
  return null
}
