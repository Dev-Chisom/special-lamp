/**
 * Authentication types
 */

export interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_tier?: string;
  subscription_status?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface SignInResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface SignUpResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

