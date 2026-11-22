import {isCloudConfigured,hasSession,apiRequest} from "./saas-client.mjs";

const panel = document.getElementById("cloud-panel");
const studio = window.AxiomAtlasStudio;
if (panel && studio && isCloudConfigured()) {
  panel.hidden = false;
  const $ = id => document.getElementById(id);
  let selectedId = null, selectedVersion = null, busy = false;
  function status(text, kind = "") {
    $("cloud-status").textContent = text;
    $("cloud-status").className = "cloud-status" + (kind ? " " + kind : "");
  }
  function actionDisabled(flag) {
    for (const id of ["cloud-save", "cloud-load", "cloud-refresh", "cloud-delete", "cloud-picker"]) {
      $(id).disabled = flag;
    }
  }
  function choose(id = null, version = null) {
    selectedId = id;
    selectedVersion = version;
  }
  async function execute(fn) {
    if (busy) return;
    busy = true; actionDisabled(true);
    try { await fn(); }
    catch (e) { status(e.message || "Cloud request failed. Your local data has not been changed.", "error"); }
    finally { actionDisabled(false); busy = false; }
  }
  async function refreshProjects(prefer = "") {
    const [account, response] = await Promise.all([
      apiRequest("GET", "/api/me"),
      apiRequest("GET", "/api/projects")
    ]);
    const plan = account.entitlements;
    $("cloud-plan").textContent = (plan.plan === "free" ? "Free cloud" : plan.plan) +
      " · Up to " + plan.maxProjects + " projects";
    const picker = $("cloud-picker");
    picker.replaceChildren(new Option("New cloud project", ""));
    for (const project of response.projects) {
      const option = new Option(project.title + " · v" + project.version, project.id);
      picker.appendChild(option);
    }
    if (prefer && response.projects.some(p => p.id === prefer)) picker.value = prefer;
    else picker.value = "";
    choose(null, null); // Selection never grants permission to overwrite without loading first.
  }
  $("cloud-picker").addEventListener("change", function() {
    choose(null, null);
    status(this.value ? "Select Load to review this cloud project before saving changes." :
      "New project selected. Save will create a separate cloud copy.");
  });
  $("cloud-refresh").addEventListener("click", () => execute(async () => {
    await refreshProjects();
    status("Project list refreshed.", "success");
  }));
  $("cloud-load").addEventListener("click", () => execute(async () => {
    const id = $("cloud-picker").value;
    if (!id) { status("Choose a saved project first.", "error"); return; }
    const response = await apiRequest("GET", "/api/projects/" + id);
    if (studio.replaceFromCloud(response.project)) {
      choose(response.project.id, response.project.version);
      $("cloud-title").value = response.project.title;
      status("Cloud project loaded into your local workspace. Changes are not auto-saved.", "success");
    } else status("Load canceled. Your local workspace is unchanged.");
  }));
  $("cloud-save").addEventListener("click", () => execute(async () => {
    const title = $("cloud-title").value.trim();
    if (title.length < 1 || title.length > 100) {
      status("Enter a project name (1–100 characters).", "error"); return;
    }
    const payload = studio.snapshot(title);
    if (!selectedId) {
      const result = await apiRequest("POST", "/api/projects", payload);
      await refreshProjects(result.project.id);
      $("cloud-picker").value = result.project.id;
      choose(result.project.id, result.project.version);
      status("New cloud project saved. Your local version remains available.", "success");
    } else {
      const result = await apiRequest("PUT", "/api/projects/" + selectedId,
        {...payload, version: selectedVersion});
      await refreshProjects(result.project.id);
      $("cloud-picker").value = result.project.id;
      choose(result.project.id, result.project.version);
      status("Cloud project saved as version " + result.project.version + ".", "success");
    }
  }));
  $("cloud-delete").addEventListener("click", () => execute(async () => {
    const id = $("cloud-picker").value;
    if (!id) { status("Select a saved project to delete.", "error"); return; }
    const label = $("cloud-picker").selectedOptions[0]?.textContent || "project";
    if (!confirm('Permanently delete cloud project "' + label + '"? Your local work will remain.')) return;
    await apiRequest("DELETE", "/api/projects/" + id);
    await refreshProjects();
    status("Cloud project deleted. Local scenarios were not removed.", "success");
  }));
  if (!hasSession()) {
    actionDisabled(true);
    status("Sign in to enable optional cloud projects. Your local calculations remain available.");
    $("cloud-account").textContent = "Sign in / create account";
  } else {
    await execute(async () => {
      await refreshProjects();
      status("Cloud storage connected. Saving is manual.", "success");
    });
  }
}
