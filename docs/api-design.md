# QuickNotes REST API

This document describes the production QuickNotes API. It is separate from the JSONPlaceholder practice endpoint used by the browser client. All routes are versioned under `/v1`; authenticated routes require `Authorization: Bearer <access-token>`. IDs are UUIDs. Responses use JSON and timestamps are ISO 8601 UTC.

## Endpoints

| Method | Path | Description | Success |
|---|---|---|---|
| POST | `/v1/auth/register` | Create a user account. | `201 Created` |
| POST | `/v1/auth/login` | Verify credentials and issue access and refresh tokens. | `200 OK` |
| GET | `/v1/notes` | List the caller's notes; supports `limit`, `cursor`, `tag` and `q`. | `200 OK` |
| POST | `/v1/notes` | Create a note owned by the caller. | `201 Created` |
| GET | `/v1/notes/{noteId}` | Fetch one note owned by the caller. | `200 OK` |
| PATCH | `/v1/notes/{noteId}` | Update supplied note fields. | `200 OK` |
| DELETE | `/v1/notes/{noteId}` | Delete a note owned by the caller. | `204 No Content` |
| PUT | `/v1/notes/{noteId}/tags/{tagId}` | Add an existing tag to a note (idempotent). | `204 No Content` |
| DELETE | `/v1/notes/{noteId}/tags/{tagId}` | Remove a tag from a note (idempotent). | `204 No Content` |

Lists are ordered by `updated_at DESC, id DESC`. A list response includes an opaque `next_cursor` or `null`; clients should follow cursors instead of using offsets at scale. Note and tag access is always scoped to the authenticated user. `PATCH` accepts `title`, `body`, and `tag_ids`; unknown fields are rejected. Titles are required and limited to 100 characters.

## Create a note

Request:

```http
POST /v1/notes HTTP/1.1
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "title": "Read later",
  "body": "Review the API design notes.",
  "tag_ids": ["8e77a88d-71d6-49c8-9155-31a250cb20d4"]
}
```

Response (`201 Created`, with a `Location: /v1/notes/{id}` header):

```json
{
  "id": "a144f85e-d791-4d5c-9950-80c962b630f8",
  "user_id": "523c765c-c40c-44b9-b3d2-244704c04920",
  "title": "Read later",
  "body": "Review the API design notes.",
  "tags": [{"id": "8e77a88d-71d6-49c8-9155-31a250cb20d4", "name": "work"}],
  "created_at": "2026-10-15T08:30:00Z",
  "updated_at": "2026-10-15T08:30:00Z"
}
```

## List notes

Request: `GET /v1/notes?limit=2&tag=work`

Response (`200 OK`):

```json
{
  "data": [
    {"id":"a144f85e-d791-4d5c-9950-80c962b630f8","title":"Read later","body":"Review the API design notes.","tags":[{"id":"8e77a88d-71d6-49c8-9155-31a250cb20d4","name":"work"}],"created_at":"2026-10-15T08:30:00Z","updated_at":"2026-10-15T08:30:00Z"},
    {"id":"d3874f3e-9bbc-4515-96e8-492e27be048a","title":"Trip ideas","body":"Compare train times.","tags":[],"created_at":"2026-10-14T12:00:00Z","updated_at":"2026-10-14T12:00:00Z"}
  ],
  "next_cursor": "eyJ1cGRhdGVkX2F0IjoiLi4uIn0"
}
```

## Errors

Errors have a stable machine-readable code, a safe human-readable message, and an optional request ID. Internal exception details are never returned.

| Status | Meaning |
|---|---|
| `400 Bad Request` | Invalid JSON, validation failure, or invalid cursor. |
| `401 Unauthorized` | Missing, expired, or invalid credentials. |
| `403 Forbidden` | Authenticated caller lacks permission for the operation. |
| `404 Not Found` | Resource does not exist or is not visible to this caller. |
| `409 Conflict` | Unique resource conflict, such as an already registered email. |
| `429 Too Many Requests` | Rate limit exceeded; may include `Retry-After`. |
| `500 Internal Server Error` | Unexpected server failure. |
| `503 Service Unavailable` | Service temporarily unavailable. |

Example (`400 Bad Request`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required and must be at most 100 characters.",
    "request_id": "req_01JAP9XWAZMZ6D8T2KQ7R5"
  }
}
```
