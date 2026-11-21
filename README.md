# Beacon And Brigade

Build a complete, working college project website called "Code Fusion — Search and Rescue Operations Coordination System" for a first-semester CSE326 Internet Programming project.

Project objective:
Create a centralized web interface that allows rescue coordinators to manage search-and-rescue incidents, divide areas into search zones, assign teams, track progress, record findings, request resources, and monitor the overall operation.

Technology requirements:

Use HTML5, CSS3, and vanilla JavaScript.

Do not use React, Next.js, TypeScript, or complicated frameworks.

Use browser LocalStorage to save demonstration data so it persists after refreshing.

Keep the code organized, beginner-friendly, and well-commented.

Create separate index.html, style.css, and script.js files where practical.

The project must run locally in a browser without paid services, API keys, or a backend.

Required features:

Dashboard

Display total incidents, active incidents, available rescue teams, search zones, and pending resource requests.

Show recent activities and current operation statuses.

Update dashboard counts when data changes.

Incident Management

Add a new rescue incident with title, location, type, severity, description, date, and status.

View all incidents.

Edit incident details and update their status.

Provide search and filtering.

Search Zone Management

Create search zones linked to incidents.

Set zone name, description, priority, and status.

Track zone progress as Pending, In Progress, or Completed.

Rescue Team Management

Display rescue teams and their availability.

Add and edit teams.

Assign an available team to a search zone.

Show which team is assigned to which zone.

Prevent conflicting active assignments for the same team.

Findings Reports

Record findings linked to an incident and search zone.

Include finding type, description, reporting team, and time.

Display reports in a searchable list.

Resource Requests

Allow teams to request additional resources.

Include incident, team, resource type, quantity, priority, and reason.

Track requests as Pending, Approved, or Fulfilled.

Operations Dashboard

Display active operations, assigned teams, zone progress, findings, and resource request statuses in one coordinated overview.

Design requirements:

Professional emergency-management dashboard design.

Dark navy sidebar, clean cards, clear typography, and readable status badges.

Responsive layout suitable for a laptop screen.

Sidebar navigation for all modules.

Working buttons, forms, validation, notifications, and navigation.

Include realistic fictional sample incidents, teams, and search zones for demonstration.

Provide a Reset Demo Data option with confirmation.

Important functional requirements:

This must be a working interactive website, not merely a static design.

Newly created incidents should appear in the incident list.

Search zones must be associated with existing incidents.

Team assignments must update availability and display correctly.

Findings and resource requests must be saved and displayed.

Dashboard statistics must reflect stored data.

Refreshing the page must not erase saved data.

Use fictional data only; this is a classroom simulation, not a live emergency-response platform.

Final deliverables:

Complete project source code.

Instructions to run the website locally.

Explanation of each file and the main functions in simple beginner-friendly language.

A short manual testing checklist for all seven required features.

A brief description of the project's limitations.

Build the simplest reliable working version first. Prioritize functionality and clarity over advanced visual effects.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://beacon-and-brigade.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2c51b6c7-b707-59ed-b26b-c6e743d0542e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
