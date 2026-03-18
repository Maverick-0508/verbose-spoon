# 🗓️ ProjectCal — Project Calendar Calculator

A modern, feature-rich project calendar calculator built for project managers to accurately estimate project deadlines.

## Features

- **📊 Dashboard** — Live project overview with countdown, progress bar, and key statistics
- **🚀 Project Setup** — Configure project name, type, team size, dates, and quick-fill duration presets
- **📈 Gantt Timeline** — Visual Gantt chart showing project bar, milestones, and sprint blocks
- **🎯 Milestones Manager** — Add, track, and complete project milestones with icons, dependencies, duration, and critical path tagging
- **⚙️ Calendar Settings** — Toggle weekends, US federal holidays, custom holidays, sprint planning, and contingency buffer
- **📤 Export & Share** — Download text reports, CSV exports, print to PDF, or copy to clipboard

## Calculator Logic

| Feature | Details |
|---|---|
| Working Days | Excludes weekends (Mon–Fri) and selected holidays |
| Buffer | Adds a configurable % of extra days as contingency |
| Sprint Planning | Divides project into equal-length sprints |
| Dependencies | Supports milestone dependency chains and cycle detection |
| Critical Path | Highlights longest dependency path for schedule-critical milestones |
| Deadline Status | Healthy / On Track / At Risk / Critical / Overdue |
| Progress | Percentage of calendar time elapsed today |

## Tech Stack

- **React 19** + **Vite 8** — fast builds & HMR
- Vanilla CSS with CSS custom properties (dark theme)
- Zero external UI library dependencies

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to use the app.

## Build

```bash
npm run build
```
