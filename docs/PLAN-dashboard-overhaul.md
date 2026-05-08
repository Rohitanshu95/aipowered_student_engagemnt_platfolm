# Plan: InterviewIQ Dashboard & Interview Room Overhaul

This plan outlines the structural and visual transformation of InterviewIQ into a premium, sidebar-driven platform as shown in the Slide 4 mockup.

## User Review Required

> [!IMPORTANT]
> The sidebar will become the **primary navigation** for the Career Suite. The existing top Navbar will remain only on public pages (Home, Pricing, Auth).

> [!WARNING]
> I will be implementing **mock data** for the "Skill Strength" Radar Chart in this phase to ensure the UI is perfect. I will verify backend integration in a follow-up step.

## Proposed Changes

### 1. Authentication & Routing [Architecture]

#### [MODIFY] [Home.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/rohit/3.interviewIQ/client/src/pages/Home.jsx)
- Update `handleStart` to check `userData` state.
- If `userData` exists -> Navigate to `/dashboard`.
- If `userData` is null -> Navigate to `/auth`.

#### [MODIFY] [App.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/rohit/3.interviewIQ/client/src/App.jsx)
- Add route for `/dashboard`.

---

### 2. Layout & Navigation [NEW]

#### [NEW] [Sidebar.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/rohit/3.interviewIQ/client/src/components/Sidebar.jsx)
- Permanent lateral navigation (Dashboard, ATS Checker, Interview Room, Skill Roadmap, Job Hub).
- "Pro Upgrade" banner at the bottom.
- Active state management for menu items.

#### [NEW] [DashboardLayout.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/rohit/3.interviewIQ/client/src/components/DashboardLayout.jsx)
- A flex layout wrapping the Sidebar and the dynamic content area.

---

### 3. Command Center (Dashboard Home) [NEW]

#### [NEW] [DashboardHome.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/rohit/3.interviewIQ/client/src/pages/DashboardHome.jsx)
- **Header**: Personalized welcome message.
- **Stats Grid**: 4 Cards (ATS Score, Mocks Taken, Avg Score, Skills Improved).
- **Recent Activity**: Styled list of recent interview/ATS actions.
- **Skill Overview**: Radar chart using `recharts` (DSA, Communication, etc.).

---

### 4. AI Interview Room Redesign [UI/UX]

#### [MODIFY] [Step2Interview.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/rohit/3.interviewIQ/client/src/components/Step2Interview.jsx)
- Transition to a **3-column layout**:
  - **Left**: Fixed-width AI Avatar / Video feed.
  - **Center**: Flexible-width Question panel and Answer textarea.
  - **Right**: Sidebar for "Live Feedback" (Technical, Communication, Confidence).
- Transition to **Dark Mode** specifically for the interview session to match the mockup.

---

## Open Questions

- **Skill Mapping**: I will use placeholder categories (DSA, System Design, etc.) for the radar chart. Let me know if you have specific categories in your database you want to map to these.
- **Avatar**: Should I use the existing video background or a static professional avatar as seen in the mockup?

## Verification Plan

### Automated Tests
- `npm run lint` to ensure no styling breaks.
- Verify routing transitions in the browser.

### Manual Verification
1. Click "Get Started" on Home -> Verify correct Auth/Dashboard redirect.
2. Navigate via Sidebar -> Verify all existing tools render inside the new layout.
3. Start an Interview -> Verify the new 3-column dark-mode interface.
