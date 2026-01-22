# Services Documentation

This directory contains all API service modules for the ApplyEngine frontend application.

## Structure

```
services/
├── api-client.ts      # Base API client with token refresh
├── auth.service.ts    # Authentication services
├── resume.service.ts  # Resume management services
├── scan.service.ts    # Resume scanning services
└── index.ts           # Central exports
```

## Usage

### API Client

The `apiClient` handles all HTTP requests with automatic token refresh and error handling.

```typescript
import { apiClient } from '@/services';

// GET request
const data = await apiClient.get('/endpoint');

// POST request
const result = await apiClient.post('/endpoint', { data });

// PUT request
const updated = await apiClient.put('/endpoint/id', { data });

// DELETE request
await apiClient.delete('/endpoint/id');
```

### Authentication Service

```typescript
import { authService } from '@/services';
import { useAuthStore } from '@/store/auth.store';

// Sign up
const response = await authService.signUp({
  email: 'user@example.com',
  password: 'password123',
  full_name: 'John Doe',
});

// Sign in
const response = await authService.signIn({
  email: 'user@example.com',
  password: 'password123',
});

// Get current user
const user = await authService.getCurrentUser();

// Sign out
authService.signOut();
```

### Using the Auth Store

```typescript
'use client';

import { useAuthStore } from '@/store/auth.store';

export function MyComponent() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuthStore();

  const handleSignIn = async () => {
    try {
      await signIn({ email: 'user@example.com', password: 'password123' });
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return (
    <div>
      <p>Welcome, {user?.full_name}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Resume Service

```typescript
import { resumeService } from '@/services';

// Get all resumes
const resumes = await resumeService.getResumes();

// Get a specific resume
const resume = await resumeService.getResume('resume-id');

// Upload a resume
const newResume = await resumeService.uploadResume({
  file: fileObject, // File object from input
});

// Update a resume
const updated = await resumeService.updateResume('resume-id', {
  file_name: 'My Resume.pdf',
});

// Delete a resume
await resumeService.deleteResume('resume-id');
```

### Scan Service

```typescript
import { scanService } from '@/services';

// Scan a resume
const result = await scanService.scanResume({
  resume_id: 'resume-id',
  job_description: 'Job description text...',
});

// Or scan with a file
const result = await scanService.scanResume({
  resume_file: fileObject,
  job_description: 'Job description text...',
});

// Get scan history
const history = await scanService.getScanHistory();

// Get a specific scan result
const scanResult = await scanService.getScanResult('scan-id');
```

## Configuration

The API base URL is configured in `lib/config.ts` and can be overridden with the `NEXT_PUBLIC_API_BASE_URL` environment variable.

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## Error Handling

All services throw `ApiClientError` on failure:

```typescript
import { ApiClientError } from '@/services';

try {
  const data = await resumeService.getResumes();
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
  }
}
```

## Authentication Persistence

Authentication state is automatically persisted using Zustand's persist middleware. When users refresh the page:

1. The `AuthProvider` component initializes auth state
2. If tokens exist, it fetches the current user to verify they're valid
3. If tokens are invalid, the user is logged out automatically
4. The auth state is restored from localStorage

This ensures users stay logged in across page refreshes.

## Protected Routes

Use the `ProtectedRoute` component to protect routes:

```typescript
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
```

