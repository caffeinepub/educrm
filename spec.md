# EduCRM

## Current State
App shows a login wall when unauthenticated. Sidebar shows principal and logout.

## Requested Changes (Diff)

### Add
- Nothing new.

### Modify
- Remove the login wall: students land directly in the CRM.
- Sidebar bottom: show "Demo Account" login button when not authenticated; avatar + logout when authenticated.

### Remove
- Full-screen login page block.

## Implementation Plan
1. Remove if (!isAuthenticated) login screen from App.tsx.
2. Update sidebar bottom to show Demo Account login/logout toggle.
3. SeedData still runs as-is.
