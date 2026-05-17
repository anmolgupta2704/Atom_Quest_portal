# AtomQuest Hackathon 1.0 — Goal Setting & Tracking Portal

## Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Employee | arjun@atomquest.in | emp123 |
| Manager | neha@atomquest.in | mgr123 |
| Admin | admin@atomquest.in | admin123 |

## Features Implemented

### Phase 1 — Goal Creation & Approval ✅
- Employee goal sheet with Thrust Area, Title, UoM, Target, Weightage
- Validation: 100% total weightage, min 10% per goal, max 8 goals
- Manager L1 approval with inline editing of targets/weightages
- Return for rework with reason
- Goal locking on approval, Admin unlock with audit trail
- Shared goals pushed from Admin (read-only title/target, weightage-only editable)

### Phase 2 — Achievement Tracking ✅
- Quarterly Q1/Q2/Q3/Q4 check-in interface
- Planned vs Actual tracking
- Status: Not Started / On Track / Completed
- System-computed progress: Min / Max / Timeline / Zero formulas
- Manager check-in comments per quarter

### Admin Portal ✅
- User management & org overview
- Cycle management
- Goal unlock with reason
- Push shared departmental KPIs
- Full audit trail with timestamps

### Reports & Analytics ✅
- Employee achievement bar chart
- QoQ trend line chart
- Department breakdown
- Detailed achievement table
- CSV export

## Local Development
```bash
npm install
npm start
npm run build
```

## Deployment — Vercel (Recommended)
1. Push to GitHub
2. vercel.com → Import → Deploy
3. Done in ~2 minutes
