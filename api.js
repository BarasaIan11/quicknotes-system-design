"use strict";

const API_URL = "https://jsonplaceholder.typicode.com/posts";
const loadButton = document.getElementById("load-btn");
const statusElement = document.getElementById("status");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
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
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteNote(note.id, item, deleteButton));
  item.append(heading, body, metadata, deleteButton);
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

async function createNote(title, body) {
  submitButton.disabled = true;
  setStatus("Creating note...");
  try {
    const { data: note, status } = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });
    const emptyItem = notesList.querySelector(".empty-state");
    if (emptyItem) emptyItem.remove();
    notesList.prepend(renderNote(note));
    setStatus(`Note created (status ${status}, id ${note.id}).`, "success");
    noteForm.reset();
  } catch (error) {
    setStatus(`Sorry, the note could not be created. ${error.message}`, "error");
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteNote(id, item, button) {
  button.disabled = true;
  setStatus("Deleting note...");
  try {
    await request(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
    item.remove();
    if (!notesList.querySelector(".note-card")) showEmptyState();
    // JSONPlaceholder simulates DELETE and does not persist creates; remove this item from the current page only.
    setStatus(`Note ${id} deleted.`, "success");
  } catch (error) {
    setStatus(`Sorry, note ${id} could not be deleted. ${error.message}`, "error");
    button.disabled = false;
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  if (!title) {
    setStatus("Please enter a title.", "error");
    titleInput.focus();
    return;
  }
  if (title.length > 100) {
    setStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }
  createNote(title, body);
});
showEmptyState();
