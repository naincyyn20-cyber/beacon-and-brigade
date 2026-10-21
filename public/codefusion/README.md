# Code Fusion — Search and Rescue Operations Coordination System
CSE326 Internet Programming project. Classroom simulation — all data is fictional.

## How to run locally
1. Put `index.html`, `style.css` and `script.js` in the same folder.
2. Double-click `index.html` (opens in Chrome/Edge/Firefox). No internet, server, or API keys needed.
3. Data is saved in your browser's LocalStorage, so it survives a refresh. Use **Reset Demo Data** in the sidebar to start over.

## Files
- **index.html** – the page structure: sidebar menu and seven sections (Dashboard, Incidents, Zones, Teams, Findings, Resources, Operations), each with its forms and tables.
- **style.css** – the look: navy sidebar, cards, tables, coloured status badges, toast message, and layout rules for smaller laptop screens.
- **script.js** – everything that happens when you click. Main functions:
  - `getSampleData()` – fictional starting incidents, zones, teams, findings and requests.
  - `loadData()` / `saveData()` – read/write the whole `db` object to LocalStorage.
  - `renderAll()` – redraws every section so all counts and lists stay in sync.
  - `saveIncident()`, `editIncident()` – add or edit incidents; `renderIncidents()` applies search and filters.
  - `saveZone()`, `setZoneStatus()` – create zones (linked to an incident) and move them Pending → In Progress → Completed. Completing a zone frees its team.
  - `saveTeam()`, `assignTeam()`, `unassignZone()` – manage teams; `assignTeam()` blocks a team that already has an active assignment.
  - `saveFinding()`, `updateFindingZones()` – record findings; the zone list only shows zones of the chosen incident.
  - `saveRequest()`, `advanceRequest()` – resource requests going Pending → Approved → Fulfilled.
  - `renderOperations()` – combined overview of each open incident with progress bar, teams, findings and requests.
  - `validate()`, `notify()`, `logActivity()` – form checks, pop-up messages, and the recent-activity log.
  - `resetDemo()` – restores sample data after a confirm box.

## Manual testing checklist
1. **Dashboard** – Note the counts. Add an incident and check "Total Incidents" goes up and it shows in Recent Activity.
2. **Incidents** – Submit an empty form (red fields + error message). Add a valid incident, find it with the search box, filter by status, edit it to "Resolved".
3. **Search Zones** – Create a zone for an incident; change its status from the dropdown; confirm it appears under that incident in Operations.
4. **Teams** – Add a team; assign an available team to a zone; check team shows "Assigned" and the zone name. Confirm the team is no longer in the "Available Team" list (no double assignment). Mark the zone Completed and check the team becomes Available.
5. **Findings** – Pick an incident (zone list updates), record a finding, then search for a word in its description.
6. **Resources** – Submit a request (Pending count goes up on Dashboard), click Approve, then Mark Fulfilled.
7. **Operations** – Check each active incident shows progress %, teams, findings and request statuses.
8. **Persistence** – Refresh the page; all changes remain. Click Reset Demo Data → confirm → original data returns.

## Limitations
- Data lives only in one browser on one computer (LocalStorage); no sharing between users and no login.
- No real maps, GPS, or live communication with teams.
- Deleting records is not supported (kept simple); edits overwrite without history.
- Not built for phones — designed for laptop screens.
- A teaching simulation only; not suitable for real emergencies.
