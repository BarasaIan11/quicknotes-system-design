# QuickNotes System Design

QuickNotes is a small browser client that demonstrates calling a REST API, paired with backend design documents for a service that can support one million registered users. The client uses JSONPlaceholder as a practice API; the documents describe a separate production QuickNotes API.

## Run the API client

Open `index.html` in a modern browser, or serve this folder over HTTP with any static file server. Choose **Load notes** to fetch ten sample posts, use the form to create a sample note, and use a note's **Delete** button to issue a delete request. JSONPlaceholder simulates creates and deletes; created notes are shown only in the current page session.

## Design documents

- [API design](docs/api-design.md)
- [Data model](docs/data-model.md)
- [Architecture](docs/architecture.md)

## What I learned

- A reusable fetch wrapper can centralize HTTP error handling while each operation owns its loading and recovery states.
- Text inserted from an API should be rendered with `textContent`, and user input needs validation before sending it.
- REST APIs benefit from explicit ownership rules, stable error shapes, and pagination contracts.
- Relational constraints and indexes make ownership and many-to-many tagging enforceable at the database layer.
- Replicas, caches, and queues improve capacity and resilience, but require clear consistency, invalidation, retry, and recovery behavior.
