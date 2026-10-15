"use strict";

const API_URL = "https://jsonplaceholder.typicode.com/posts";
const loadButton = document.getElementById("load-btn");
const statusElement = document.getElementById("status");
const notesList = document.getElementById("notes-list");

function setStatus(message, kind = "") {
  statusElement.textContent = message;
  statusElement.className = `status${kind ? ` status--${kind}` : ""}`;
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return { data: await response.json(), status: response.status };
}

function renderNote(note) {
  const item = document.createElement("li");
  item.className = "note-card";
  const heading = document.createElement("h3");
  heading.textContent = note.title || "Untitled note";
  const body = document.createElement("p");
  body.textContent = note.body || "";
  const metadata = document.createElement("small");
  metadata.textContent = `Note ID: ${note.id}`;
  item.append(heading, body, metadata);
  return item;
}

function showEmptyState() {
  notesList.replaceChildren();
  const emptyItem = document.createElement("li");
  emptyItem.className = "empty-state";
  emptyItem.textContent = "No notes yet. Load notes to get started.";
  notesList.append(emptyItem);
}

async function loadNotes() {
  loadButton.disabled = true;
  setStatus("Loading notes...");
  try {
    const { data: notes } = await request(`${API_URL}?_limit=10`);
    notesList.replaceChildren();
    if (!notes.length) {
      showEmptyState();
      setStatus("No notes were returned.");
      return;
    }
    notes.forEach((note) => notesList.append(renderNote(note)));
    setStatus(`Loaded ${notes.length} notes from the server.`, "success");
  } catch (error) {
    setStatus(`Sorry, notes could not be loaded. ${error.message}`, "error");
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadNotes);
showEmptyState();
