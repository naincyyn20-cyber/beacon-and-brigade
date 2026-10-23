/* =========================================================
   Code Fusion — Search and Rescue Operations Coordination
   script.js : all the behaviour of the website.
   Data is kept in one object "db" and saved to LocalStorage.
   ========================================================= */

const STORAGE_KEY = "codeFusionSAR";
let db; // holds incidents, zones, teams, findings, requests, activities

/* ---------- 1. SAMPLE (FICTIONAL) DEMO DATA ---------- */
function getSampleData() {
  return {
    incidents: [
      { id: "i1", title: "Riverbend Valley Flash Flood", location: "Riverbend Valley, North District", type: "Flood", severity: "Critical", description: "Heavy rainfall caused river overflow. Several residents reported stranded on rooftops.", date: "2026-10-18", status: "Active" },
      { id: "i2", title: "Missing Hiker — Pine Ridge Trail", location: "Pine Ridge National Park", type: "Missing Person", severity: "High", description: "Solo hiker (fictional) failed to return from day hike. Last seen at trail marker 7.", date: "2026-10-19", status: "Active" },
      { id: "i3", title: "Old Mill Warehouse Collapse", location: "Old Mill Industrial Area", type: "Building Collapse", severity: "Medium", description: "Partial roof collapse after storm. Area secured, debris check ongoing.", date: "2026-10-12", status: "Monitoring" },
      { id: "i4", title: "Cedar Hills Landslide", location: "Cedar Hills Road", type: "Landslide", severity: "Low", description: "Minor landslide blocked road. No casualties. Road cleared.", date: "2026-10-05", status: "Resolved" }
    ],
    zones: [
      { id: "z1", incidentId: "i1", name: "Zone A — East Riverbank", description: "Residential blocks along east bank.", priority: "High", status: "In Progress", teamId: "t1" },
      { id: "z2", incidentId: "i1", name: "Zone B — Lower Market", description: "Flooded market streets.", priority: "Medium", status: "Pending", teamId: null },
      { id: "z3", incidentId: "i2", name: "Sector 1 — Trail Marker 5-8", description: "Main trail and side paths.", priority: "High", status: "In Progress", teamId: "t2" },
      { id: "z4", incidentId: "i2", name: "Sector 2 — North Ravine", description: "Steep ravine north of the trail.", priority: "High", status: "Pending", teamId: null },
      { id: "z5", incidentId: "i3", name: "Warehouse Interior", description: "Collapsed roof section.", priority: "Medium", status: "Completed", teamId: null }
    ],
    teams: [
      { id: "t1", name: "Alpha Water Rescue", leader: "R. Mehta", members: 6, specialty: "Water Rescue", status: "Assigned" },
      { id: "t2", name: "Bravo K9 Unit", leader: "S. Kapoor", members: 4, specialty: "K9 Search", status: "Assigned" },
      { id: "t3", name: "Charlie Medical", leader: "A. Singh", members: 5, specialty: "Medical", status: "Available" },
      { id: "t4", name: "Delta Drone Recon", leader: "P. Nair", members: 3, specialty: "Drone Recon", status: "Available" },
      { id: "t5", name: "Echo Mountain Team", leader: "K. Das", members: 7, specialty: "Mountain Rescue", status: "Off Duty" }
    ],
    findings: [
      { id: "f1", incidentId: "i1", zoneId: "z1", type: "Survivor Located", description: "Family of 3 rescued from rooftop at Block 12.", teamId: "t1", time: "2026-10-19T09:30" },
      { id: "f2", incidentId: "i2", zoneId: "z3", type: "Clue / Trail", description: "Water bottle found near marker 6.", teamId: "t2", time: "2026-10-20T14:10" }
    ],
    requests: [
      { id: "r1", incidentId: "i1", teamId: "t1", resourceType: "Boats", quantity: 2, priority: "High", reason: "Water levels rising in Zone A.", status: "Pending" },
      { id: "r2", incidentId: "i2", teamId: "t2", resourceType: "Thermal Cameras", quantity: 1, priority: "Medium", reason: "Night search planned.", status: "Approved" }
    ],
    activities: [
      { text: "Demo data loaded.", time: new Date().toLocaleString() }
    ]
  };
}

/* ---------- 2. STORAGE HELPERS ---------- */
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  db = saved ? JSON.parse(saved) : getSampleData();
  saveData();
}
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}
// Creates a simple unique id like "i1729..."
function makeId(prefix) {
  return prefix + Date.now() + Math.floor(Math.random() * 1000);
}
// Adds a line to the "Recent Activity" list
function logActivity(text) {
  db.activities.unshift({ text, time: new Date().toLocaleString() });
  db.activities = db.activities.slice(0, 30); // keep last 30
}

/* ---------- 3. SMALL UTILITIES ---------- */
const $ = (id) => document.getElementById(id);
function findById(list, id) { return list.find((x) => x.id === id); }
function incidentName(id) { const i = findById(db.incidents, id); return i ? i.title : "—"; }
function zoneName(id) { const z = findById(db.zones, id); return z ? z.name : "—"; }
function teamName(id) { const t = findById(db.teams, id); return t ? t.name : "—"; }
// Prevents HTML injection when showing user text
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
// Returns a coloured badge for any status/severity word
function badge(text) {
  const colours = {
    Critical: "b-red", High: "b-red", Active: "b-red", Pending: "b-amber", Medium: "b-amber",
    Monitoring: "b-amber", "In Progress": "b-blue", Assigned: "b-blue", Approved: "b-blue",
    Low: "b-green", Resolved: "b-green", Completed: "b-green", Available: "b-green", Fulfilled: "b-green",
    "Off Duty": "b-gray"
  };
  return `<span class="badge ${colours[text] || "b-gray"}">${esc(text)}</span>`;
}
// Shows a toast notification at the bottom-right
function notify(message, isError = false) {
  const t = $("toast");
  t.textContent = message;
  t.className = "toast show" + (isError ? " error" : "");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => (t.className = "toast"), 2800);
}
// Checks that every listed field has a value; highlights empty ones
function validate(fieldIds) {
  let ok = true;
  fieldIds.forEach((id) => {
    const el = $(id);
    const empty = !el.value.trim() || (el.type === "number" && Number(el.value) < 1);
    el.classList.toggle("invalid", empty);
    if (empty) ok = false;
  });
  if (!ok) notify("Please fill in all required fields.", true);
  return ok;
}
function emptyRow(cols, text) { return `<tr><td colspan="${cols}" class="empty">${text}</td></tr>`; }
// Fills a <select> with options
function fillSelect(id, items, placeholder) {
  const sel = $(id);
  const old = sel.value;
  sel.innerHTML = `<option value="">${placeholder}</option>` +
    items.map((x) => `<option value="${x.value}">${esc(x.label)}</option>`).join("");
  if ([...sel.options].some((o) => o.value === old)) sel.value = old;
}

// "Other" dropdown support: when the user picks "Other", an extra
// text box appears so they can type their own incident type or specialty.
const INCIDENT_TYPES = ["Flood", "Earthquake", "Missing Person", "Landslide", "Building Collapse", "Wildfire"];
const TEAM_SPECIALTIES = ["Water Rescue", "K9 Search", "Medical", "Urban Search", "Urban Search and Rescue", "Mountain Rescue", "Drone Recon", "Technical Rescue", "Communications Support"];
function syncIncidentType() {
  $("incTypeOtherWrap").style.display = $("incType").value === "Other" ? "" : "none";
}
function syncTeamSpecialty() {
  $("teamSpecialtyOtherWrap").style.display = $("teamSpecialty").value === "Other" ? "" : "none";
}
// Reads the dropdown; if "Other" is chosen, uses the typed text instead.
// Returns "" (and shows an error) if "Other" is selected but left empty.
function resolveOther(selectId, otherId) {
  if ($(selectId).value !== "Other") return $(selectId).value;
  const val = $(otherId).value.trim();
  if (!val) {
    $(otherId).classList.add("invalid");
    notify("Please fill in all required fields.", true);
    return "";
  }
  return val;
}
// Fills a dropdown when editing: known values go in the dropdown,
// anything else (a saved custom value) goes into "Other" + the text box.
function setOtherSelect(selectId, otherId, syncFn, fixedOptions, savedValue) {
  if (fixedOptions.includes(savedValue)) {
    $(selectId).value = savedValue; $(otherId).value = "";
  } else {
    $(selectId).value = "Other"; $(otherId).value = savedValue;
  }
  syncFn();
}

/* ---------- 4. NAVIGATION ---------- */
function showSection(name) {
  document.querySelectorAll(".section").forEach((s) => s.classList.toggle("active", s.id === name));
  document.querySelectorAll(".nav-link").forEach((b) => b.classList.toggle("active", b.dataset.section === name));
  toggleMenu(false); // close mobile menu after choosing a page
  window.scrollTo(0, 0);
}

// Mobile hamburger menu: open/close the sidebar on small screens
function toggleMenu(open) {
  const isOpen = open === undefined ? !document.body.classList.contains("menu-open") : open;
  document.body.classList.toggle("menu-open", isOpen);
  const btn = document.getElementById("menuBtn");
  if (btn) btn.setAttribute("aria-expanded", String(isOpen));
}

// Copy each table header text into its cells (data-label) so tables
// can turn into readable cards on mobile screens.
function labelTableCells() {
  document.querySelectorAll("table").forEach((table) => {
    const heads = [...table.querySelectorAll("thead th")].map((th) => th.textContent.trim());
    table.querySelectorAll("tbody tr").forEach((tr) => {
      [...tr.children].forEach((td, i) => td.setAttribute("data-label", heads[i] || ""));
    });
  });
}

/* ---------- 5. RENDER EVERYTHING ---------- */
// Called after every change so all screens stay in sync
function renderAll() {
  renderDashboard();
  renderIncidents();
  renderZones();
  renderTeams();
  renderFindings();
  renderRequests();
  renderOperations();
  renderDropdowns();
  labelTableCells();
}

/* ----- Dashboard ----- */
function renderDashboard() {
  $("statTotal").textContent = db.incidents.length;
  $("statActive").textContent = db.incidents.filter((i) => i.status === "Active").length;
  $("statTeams").textContent = db.teams.filter((t) => t.status === "Available").length;
  $("statZones").textContent = db.zones.length;
  $("statRequests").textContent = db.requests.filter((r) => r.status === "Pending").length;

  $("activityList").innerHTML = db.activities.length
    ? db.activities.map((a) => `<li>${esc(a.text)}<small>${esc(a.time)}</small></li>`).join("")
    : "<li>No activity yet.</li>";

  $("dashIncidents").innerHTML = db.incidents.length
    ? db.incidents.map((i) => `<tr><td>${esc(i.title)}</td><td>${badge(i.severity)}</td><td>${badge(i.status)}</td></tr>`).join("")
    : emptyRow(3, "No incidents.");
}

/* ----- Incidents ----- */
function renderIncidents() {
  const q = $("incSearch").value.toLowerCase();
  const fs = $("incFilterStatus").value;
  const fv = $("incFilterSeverity").value;
  const list = db.incidents.filter((i) =>
    (i.title + " " + i.location).toLowerCase().includes(q) &&
    (!fs || i.status === fs) && (!fv || i.severity === fv));

  $("incidentTable").innerHTML = list.length ? list.map((i) => `
    <tr>
      <td><strong>${esc(i.title)}</strong></td><td>${esc(i.location)}</td><td>${esc(i.type)}</td>
      <td>${badge(i.severity)}</td><td>${esc(i.date)}</td><td>${badge(i.status)}</td>
      <td><button class="btn btn-sm" onclick="editIncident('${i.id}')">Edit</button></td>
    </tr>`).join("") : emptyRow(7, "No incidents match.");
}
function saveIncident(e) {
  e.preventDefault();
  if (!validate(["incTitle", "incLocation", "incDate", "incDesc"])) return;
  const type = resolveOther("incType", "incTypeOther");
  if (!type) return;
  const data = {
    title: $("incTitle").value.trim(), location: $("incLocation").value.trim(),
    type, severity: $("incSeverity").value, date: $("incDate").value,
    status: $("incStatus").value, description: $("incDesc").value.trim()
  };
  const id = $("incidentId").value;
  if (id) {
    Object.assign(findById(db.incidents, id), data);
    logActivity(`Incident updated: ${data.title} (${data.status})`);
    notify("Incident updated.");
  } else {
    db.incidents.unshift({ id: makeId("i"), ...data });
    logActivity(`New incident reported: ${data.title}`);
    notify("Incident added.");
  }
  saveData(); clearIncidentForm(); renderAll();
}
function editIncident(id) {
  const i = findById(db.incidents, id);
  $("incidentId").value = i.id; $("incTitle").value = i.title; $("incLocation").value = i.location;
  setOtherSelect("incType", "incTypeOther", syncIncidentType, INCIDENT_TYPES, i.type);
  $("incSeverity").value = i.severity; $("incDate").value = i.date;
  $("incStatus").value = i.status; $("incDesc").value = i.description;
  $("incidentFormTitle").textContent = "Edit Incident";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function clearIncidentForm() {
  $("incidentForm").reset(); $("incidentId").value = "";
  $("incidentFormTitle").textContent = "Add New Incident";
  $("incDate").value = new Date().toISOString().slice(0, 10);
  syncIncidentType();
}

/* ----- Search Zones ----- */
function renderZones() {
  $("zoneTable").innerHTML = db.zones.length ? db.zones.map((z) => `
    <tr>
      <td><strong>${esc(z.name)}</strong><br><small>${esc(z.description)}</small></td>
      <td>${esc(incidentName(z.incidentId))}</td><td>${badge(z.priority)}</td>
      <td>
        <select onchange="setZoneStatus('${z.id}', this.value)">
          ${["Pending", "In Progress", "Completed"].map((s) => `<option ${s === z.status ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </td>
      <td>${z.teamId ? esc(teamName(z.teamId)) : '<span class="badge b-gray">Unassigned</span>'}</td>
      <td>
        <button class="btn btn-sm" onclick="editZone('${z.id}')">Edit</button>
        ${z.teamId ? `<button class="btn btn-sm" onclick="unassignZone('${z.id}')">Unassign</button>` : ""}
      </td>
    </tr>`).join("") : emptyRow(6, "No search zones yet.");
}
function saveZone(e) {
  e.preventDefault();
  if (!validate(["zoneIncident", "zoneName", "zoneDesc"])) return;
  const data = {
    incidentId: $("zoneIncident").value, name: $("zoneName").value.trim(),
    priority: $("zonePriority").value, description: $("zoneDesc").value.trim()
  };
  const id = $("zoneId").value;
  if (id) {
    const z = findById(db.zones, id);
    Object.assign(z, data);
    applyZoneStatus(z, $("zoneStatus").value);
    logActivity(`Zone updated: ${z.name}`);
    notify("Zone updated.");
  } else {
    db.zones.push({ id: makeId("z"), ...data, status: $("zoneStatus").value, teamId: null });
    logActivity(`Search zone created: ${data.name}`);
    notify("Zone created.");
  }
  saveData(); clearZoneForm(); renderAll();
}
// Sets a zone status; completing a zone releases its team
function applyZoneStatus(zone, status) {
  zone.status = status;
  if (status === "Completed" && zone.teamId) {
    const t = findById(db.teams, zone.teamId);
    if (t) t.status = "Available";
    zone.teamId = null;
  }
}
function setZoneStatus(id, status) {
  const z = findById(db.zones, id);
  applyZoneStatus(z, status);
  logActivity(`Zone "${z.name}" marked ${status}`);
  saveData(); renderAll(); notify("Zone status updated.");
}
function editZone(id) {
  const z = findById(db.zones, id);
  $("zoneId").value = z.id; $("zoneIncident").value = z.incidentId; $("zoneName").value = z.name;
  $("zonePriority").value = z.priority; $("zoneStatus").value = z.status; $("zoneDesc").value = z.description;
  $("zoneFormTitle").textContent = "Edit Search Zone";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function clearZoneForm() {
  $("zoneForm").reset(); $("zoneId").value = "";
  $("zoneFormTitle").textContent = "Create Search Zone";
}
function unassignZone(zoneId) {
  const z = findById(db.zones, zoneId);
  const t = findById(db.teams, z.teamId);
  if (t) t.status = "Available";
  logActivity(`${teamName(z.teamId)} unassigned from ${z.name}`);
  z.teamId = null;
  saveData(); renderAll(); notify("Team unassigned.");
}

/* ----- Teams ----- */
function renderTeams() {
  $("teamTable").innerHTML = db.teams.length ? db.teams.map((t) => {
    const zone = db.zones.find((z) => z.teamId === t.id);
    return `<tr>
      <td><strong>${esc(t.name)}</strong></td><td>${esc(t.leader)}</td><td>${t.members}</td>
      <td>${esc(t.specialty)}</td><td>${badge(t.status)}</td>
      <td>${zone ? esc(zone.name) : "—"}</td>
      <td><button class="btn btn-sm" onclick="editTeam('${t.id}')">Edit</button></td>
    </tr>`;
  }).join("") : emptyRow(7, "No teams.");
}
function saveTeam(e) {
  e.preventDefault();
  if (!validate(["teamName", "teamLeader", "teamMembers"])) return;
  const specialty = resolveOther("teamSpecialty", "teamSpecialtyOther");
  if (!specialty) return;
  const data = {
    name: $("teamName").value.trim(), leader: $("teamLeader").value.trim(),
    members: Number($("teamMembers").value), specialty
  };
  const chosen = $("teamStatus").value;
  const id = $("teamId").value;
  if (id) {
    const t = findById(db.teams, id);
    Object.assign(t, data);
    // An assigned team keeps "Assigned" unless the coordinator sets Off Duty (which frees the zone)
    if (t.status === "Assigned" && chosen === "Off Duty") {
      const z = db.zones.find((z) => z.teamId === t.id);
      if (z) z.teamId = null;
      t.status = "Off Duty";
    } else if (t.status !== "Assigned") {
      t.status = chosen;
    }
    logActivity(`Team updated: ${t.name}`);
    notify("Team updated.");
  } else {
    db.teams.push({ id: makeId("t"), ...data, status: chosen });
    logActivity(`New team added: ${data.name}`);
    notify("Team added.");
  }
  saveData(); clearTeamForm(); renderAll();
}
function editTeam(id) {
  const t = findById(db.teams, id);
  $("teamId").value = t.id; $("teamName").value = t.name; $("teamLeader").value = t.leader;
  $("teamMembers").value = t.members;
  setOtherSelect("teamSpecialty", "teamSpecialtyOther", syncTeamSpecialty, TEAM_SPECIALTIES, t.specialty);
  $("teamStatus").value = t.status === "Off Duty" ? "Off Duty" : "Available";
  $("teamFormTitle").textContent = "Edit Team";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function clearTeamForm() {
  $("teamForm").reset(); $("teamId").value = "";
  $("teamFormTitle").textContent = "Add Team";
  syncTeamSpecialty();
}
// Assigns a team to a zone, with conflict checks
function assignTeam(e) {
  e.preventDefault();
  if (!validate(["assignTeam", "assignZone"])) return;
  const team = findById(db.teams, $("assignTeam").value);
  const zone = findById(db.zones, $("assignZone").value);
  // Conflict check: a team may hold only one active assignment
  if (team.status !== "Available" || db.zones.some((z) => z.teamId === team.id)) {
    notify(`${team.name} already has an active assignment.`, true); return;
  }
  if (zone.status === "Completed") { notify("Cannot assign to a completed zone.", true); return; }
  // If zone already had a team, release it first
  if (zone.teamId) { const old = findById(db.teams, zone.teamId); if (old) old.status = "Available"; }
  zone.teamId = team.id;
  if (zone.status === "Pending") zone.status = "In Progress";
  team.status = "Assigned";
  logActivity(`${team.name} assigned to ${zone.name}`);
  saveData(); $("assignForm").reset(); renderAll();
  notify("Team assigned successfully.");
}

/* ----- Findings ----- */
function renderFindings() {
  const q = $("findSearch").value.toLowerCase();
  const list = db.findings.filter((f) =>
    [f.type, f.description, incidentName(f.incidentId), zoneName(f.zoneId), teamName(f.teamId)]
      .join(" ").toLowerCase().includes(q))
    .sort((a, b) => b.time.localeCompare(a.time));
  $("findingTable").innerHTML = list.length ? list.map((f) => `
    <tr><td>${esc(f.time.replace("T", " "))}</td><td>${badge(f.type)}</td>
    <td>${esc(incidentName(f.incidentId))}</td><td>${esc(zoneName(f.zoneId))}</td>
    <td>${esc(teamName(f.teamId))}</td><td>${esc(f.description)}</td></tr>`).join("")
    : emptyRow(6, "No findings found.");
}
function saveFinding(e) {
  e.preventDefault();
  if (!validate(["findIncident", "findZone", "findTeam", "findTime", "findDesc"])) return;
  const f = {
    id: makeId("f"), incidentId: $("findIncident").value, zoneId: $("findZone").value,
    type: $("findType").value, teamId: $("findTeam").value, time: $("findTime").value,
    description: $("findDesc").value.trim()
  };
  db.findings.push(f);
  logActivity(`Finding recorded (${f.type}) in ${zoneName(f.zoneId)}`);
  saveData(); $("findingForm").reset(); setNowTime(); renderAll();
  notify("Finding saved.");
}
// Only show zones belonging to the selected incident
function updateFindingZones() {
  const inc = $("findIncident").value;
  fillSelect("findZone", db.zones.filter((z) => z.incidentId === inc).map((z) => ({ value: z.id, label: z.name })),
    inc ? "Select zone" : "Select incident first");
}
function setNowTime() {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  $("findTime").value = d.toISOString().slice(0, 16);
}

/* ----- Resource Requests ----- */
function renderRequests() {
  const next = { Pending: "Approve", Approved: "Mark Fulfilled" };
  $("requestTable").innerHTML = db.requests.length ? db.requests.map((r) => `
    <tr><td><strong>${esc(r.resourceType)}</strong></td><td>${r.quantity}</td>
    <td>${esc(incidentName(r.incidentId))}</td><td>${esc(teamName(r.teamId))}</td>
    <td>${badge(r.priority)}</td><td>${esc(r.reason)}</td><td>${badge(r.status)}</td>
    <td>${next[r.status] ? `<button class="btn btn-sm" onclick="advanceRequest('${r.id}')">${next[r.status]}</button>` : ""}</td></tr>`).join("")
    : emptyRow(8, "No requests.");
}
function saveRequest(e) {
  e.preventDefault();
  if (!validate(["reqIncident", "reqTeam", "reqQty", "reqReason"])) return;
  const r = {
    id: makeId("r"), incidentId: $("reqIncident").value, teamId: $("reqTeam").value,
    resourceType: $("reqType").value, quantity: Number($("reqQty").value),
    priority: $("reqPriority").value, reason: $("reqReason").value.trim(), status: "Pending"
  };
  db.requests.unshift(r);
  logActivity(`${teamName(r.teamId)} requested ${r.quantity} × ${r.resourceType}`);
  saveData(); $("requestForm").reset(); renderAll();
  notify("Resource request submitted.");
}
// Pending -> Approved -> Fulfilled
function advanceRequest(id) {
  const r = findById(db.requests, id);
  r.status = r.status === "Pending" ? "Approved" : "Fulfilled";
  logActivity(`Request for ${r.resourceType} is now ${r.status}`);
  saveData(); renderAll(); notify(`Request ${r.status.toLowerCase()}.`);
}

/* ----- Operations overview ----- */
function renderOperations() {
  const ops = db.incidents.filter((i) => i.status !== "Resolved");
  $("opsContainer").innerHTML = ops.length ? ops.map((i) => {
    const zones = db.zones.filter((z) => z.incidentId === i.id);
    const done = zones.filter((z) => z.status === "Completed").length;
    const pct = zones.length ? Math.round((done / zones.length) * 100) : 0;
    const finds = db.findings.filter((f) => f.incidentId === i.id);
    const reqs = db.requests.filter((r) => r.incidentId === i.id);
    return `<div class="card">
      <div class="op-header"><h3>${esc(i.title)}</h3><div>${badge(i.severity)} ${badge(i.status)}</div></div>
      <small>${esc(i.location)} — Zone progress: ${done}/${zones.length} completed (${pct}%)</small>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <div class="op-cols">
        <div><h4>Zones &amp; Teams</h4><ul>${zones.map((z) =>
          `<li>${esc(z.name)} ${badge(z.status)}<br><small>Team: ${z.teamId ? esc(teamName(z.teamId)) : "Unassigned"}</small></li>`).join("") || "<li>No zones</li>"}</ul></div>
        <div><h4>Findings (${finds.length})</h4><ul>${finds.map((f) =>
          `<li>${badge(f.type)} ${esc(f.description)}</li>`).join("") || "<li>No findings</li>"}</ul></div>
        <div><h4>Resource Requests</h4><ul>${reqs.map((r) =>
          `<li>${r.quantity} × ${esc(r.resourceType)} ${badge(r.status)}</li>`).join("") || "<li>No requests</li>"}</ul></div>
      </div></div>`;
  }).join("") : '<div class="card empty">No active operations.</div>';
}

/* ----- Dropdown lists used by forms ----- */
function renderDropdowns() {
  const incidents = db.incidents.map((i) => ({ value: i.id, label: i.title }));
  const openIncidents = db.incidents.filter((i) => i.status !== "Resolved").map((i) => ({ value: i.id, label: i.title }));
  const teams = db.teams.map((t) => ({ value: t.id, label: t.name }));
  fillSelect("zoneIncident", incidents, "Select incident");
  fillSelect("findIncident", incidents, "Select incident");
  fillSelect("reqIncident", openIncidents, "Select incident");
  fillSelect("findTeam", teams, "Select team");
  fillSelect("reqTeam", teams, "Select team");
  fillSelect("assignTeam", db.teams.filter((t) => t.status === "Available").map((t) => ({ value: t.id, label: `${t.name} (${t.specialty})` })), "Select available team");
  fillSelect("assignZone", db.zones.filter((z) => z.status !== "Completed").map((z) => ({
    value: z.id, label: `${z.name}${z.teamId ? " — has " + teamName(z.teamId) : ""}` })), "Select zone");
  updateFindingZones();
}

/* ---------- 6. RESET DEMO DATA ---------- */
function resetDemo() {
  if (!confirm("Reset all data to the original demo data? Your changes will be lost.")) return;
  db = getSampleData();
  saveData(); renderAll(); notify("Demo data has been reset.");
}

/* ---------- 7. START-UP: connect buttons and forms ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  document.querySelectorAll(".nav-link").forEach((b) => b.addEventListener("click", () => showSection(b.dataset.section)));
  $("incidentForm").addEventListener("submit", saveIncident);
  $("incidentCancel").addEventListener("click", clearIncidentForm);
  ["incSearch", "incFilterStatus", "incFilterSeverity"].forEach((id) => $(id).addEventListener("input", () => { renderIncidents(); labelTableCells(); }));
  $("zoneForm").addEventListener("submit", saveZone);
  $("zoneCancel").addEventListener("click", clearZoneForm);
  $("teamForm").addEventListener("submit", saveTeam);
  $("teamCancel").addEventListener("click", clearTeamForm);
  $("assignForm").addEventListener("submit", assignTeam);
  $("findingForm").addEventListener("submit", saveFinding);
  $("findIncident").addEventListener("change", updateFindingZones);
  $("findSearch").addEventListener("input", () => { renderFindings(); labelTableCells(); });
  $("incType").addEventListener("change", syncIncidentType);
  $("teamSpecialty").addEventListener("change", syncTeamSpecialty);
  $("requestForm").addEventListener("submit", saveRequest);
  $("resetBtn").addEventListener("click", resetDemo);
  // Remove red highlight as soon as the user types
  document.addEventListener("input", (e) => e.target.classList && e.target.classList.remove("invalid"));
  clearIncidentForm(); setNowTime();
  renderAll();
});
