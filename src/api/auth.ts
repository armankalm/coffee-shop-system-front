import { apiPost } from './client'

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  email: string
  role: string
  permissions?: string[]
}

export function requestCode(email: string) {
  return apiPost<{ message: string; devCode?: string }>('/auth/request-code', { email })
}

export function verifyCode(email: string, code: string) {
  return apiPost<AuthResponse>('/auth/verify-code', { email, code })
}
