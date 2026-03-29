# EduCRM - Mock CRM Simulator

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Full MVP CRM application with bilingual support (English / Greek)
- Shared workspace: all users see the same company data
- Role-based access: Admin and Agent roles

**Core Modules:**
1. **Dashboard** -- KPI cards (total contacts, open deals, tasks due today, revenue pipeline), recent activity feed
2. **Contacts** -- CRUD for people/companies: name, email, phone, company, status (Lead/Customer/Prospect/Inactive), notes count, last activity
3. **Deals / Pipeline** -- Kanban board with stages: New Lead → Qualified → Proposal → Negotiation → Closed Won / Closed Lost. Each deal has title, contact, value (€), stage, expected close date, notes
4. **Activities / Tasks** -- Log calls, meetings, emails, tasks. Each linked to a contact or deal. Status: pending/done. Due date.
5. **Notes** -- Free-text notes attachable to contacts or deals
6. **Reports** -- Simple stats: deals by stage (bar chart), contacts by status (pie chart), monthly deal closures
7. **Language switcher** -- Toggle between English (EN) and Greek (GR) for all UI labels

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Motoko actors for Contacts, Deals, Activities, Notes entities with full CRUD
2. Authorization component for role-based access (Admin / Agent)
3. Frontend: React app with sidebar navigation, bilingual i18n context, all 6 modules
4. Dashboard with computed stats from backend data
5. Kanban drag-and-drop for pipeline
6. Charts (recharts) for reports
7. Seed sample data for classroom demo
