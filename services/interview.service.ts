/**
 * Interview Service
 * Handles interview practice API calls
 */

import { apiClient } from './api-client';

// ============================================================================
// Types
// ============================================================================

export interface InterviewQuestion {
  question: string;
  type: string;
  answer?: string;
  score?: number;
  feedback?: string;
}

export interface StartInterviewRequest {
  role: string;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal';
  stage: 'phone_screen' | 'technical' | 'behavioral' | 'final';
  job_id?: string;
}

export interface StartInterviewResponse {
  session_id: string;
  questions: InterviewQuestion[];
}

export interface SubmitAnswerRequest {
  question: string;
  answer: string;
}

export interface SubmitAnswerResponse {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewSession {
  id: string;
  user_id: string;
  job_id?: string | null;
  role: string;
  seniority: string;
  stage: string;
  questions: InterviewQuestion[];
  overall_score?: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Interview Service
// ============================================================================

class InterviewService {
  /**
   * Start a new interview practice session
   * Endpoint: POST /api/v1/interview/start
   */
  async startInterview(data: StartInterviewRequest): Promise<StartInterviewResponse> {
    return apiClient.post<StartInterviewResponse>('/interview/start', {
      role: data.role,
      seniority: data.seniority,
      stage: data.stage,
      job_id: data.job_id,
    });
  }

  /**
   * Submit an answer for evaluation
   * Endpoint: POST /api/v1/interview/answer?session_id={session_id}
   */
  async submitAnswer(sessionId: string, data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    return apiClient.post<SubmitAnswerResponse>(`/interview/answer?session_id=${sessionId}`, {
      question: data.question,
      answer: data.answer,
    });
  }

  /**
   * Get a specific interview session by ID
   * Endpoint: GET /api/v1/interview/{session_id}
   */
  async getSession(sessionId: string): Promise<InterviewSession> {
    return apiClient.get<InterviewSession>(`/interview/${sessionId}`);
  }

  /**
   * List all interview sessions for the current user
   * Endpoint: GET /api/v1/interview/sessions
   */
  async getSessions(): Promise<InterviewSession[]> {
    return apiClient.get<InterviewSession[]>('/interview/sessions');
  }
}

// Export singleton instance
export const interviewService = new InterviewService();

