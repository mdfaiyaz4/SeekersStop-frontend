export function getApiErrorMessage(error, fallback) {
  const responseData = error.response?.data
  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message
  }
  if (typeof responseData === 'string' && responseData.trim()) return responseData
  if (error.code === 'ERR_NETWORK') {
    return 'Could not reach the server. Check that the backend is running and try again.'
  }
  return fallback
}
