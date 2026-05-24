# School Administration System

A Node.js/TypeScript REST API for managing teachers, students, classes and subjects.

## Node.js Version

**Node.js v22** (LTS). Any v18+ should also work.

## Prerequisites

- [Node.js v22](https://nodejs.org/)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start MySQL and the external student service via Docker
npm run start:services

# 3. Start the development server (auto-restarts on file changes)
npm run start:dev
```

The API is available at **http://localhost:3000**.

> **Note:** `start:services` waits for Docker containers to start. If the app
> fails to connect on first launch it will retry up to 20 times (3 s apart).

## Environment Variables

Copy `.env.sample` to `.env` and adjust as needed. Defaults work out of the box
with the provided `docker-compose.yml`.

| Variable           | Default                    | Description                     |
|--------------------|----------------------------|---------------------------------|
| `PORT`             | `3000`                     | HTTP server port                |
| `DB_HOST`          | `127.0.0.1`                | MySQL host                      |
| `DB_PORT`          | `33306`                    | MySQL port (Docker mapping)     |
| `DB_SCHEMA`        | `school-administration-system` | Database name               |
| `DB_USER`          | `root`                     | MySQL user                      |
| `DB_PW`            | `password`                 | MySQL password                  |
| `EXTERNAL_BASE_URL`| `http://localhost:5000`    | External student-service URL    |

## API Endpoints

### 1. DataUpload — `POST /api/upload`

Upload a CSV file to create, update or delete teachers/students/classes.

```
Content-Type: multipart/form-data
Field name:   data
```

| Column        | Type   | Required | Description                              |
|---------------|--------|----------|------------------------------------------|
| teacherEmail  | string | yes      | Unique identifier of teacher             |
| teacherName   | string | yes      | Display name of teacher                  |
| studentEmail  | string | yes      | Unique identifier of student             |
| studentName   | string | yes      | Display name of student                  |
| classCode     | string | yes      | Unique identifier of class               |
| classname     | string | yes      | Display name of class                    |
| subjectCode   | string | yes      | Unique identifier of subject             |
| subjectName   | string | yes      | Display name of subject                  |
| toDelete      | 0 or 1 | yes     | 1 = teacher no longer teaches this student |

- **Success:** `204 No Content`
- **Error:** `400 Bad Request` / `500 Internal Server Error`

---

### 2. StudentListing — `GET /api/class/:classCode/students`

Returns a paginated, alphanumerically sorted list of all students (internal and
external) enrolled in the given class.

**Query params:**

| Param  | Type    | Description                                        |
|--------|---------|----------------------------------------------------|
| offset | integer | Records to skip (≥ 0)                              |
| limit  | integer | Records to return (> 0)                            |

**Response `200`:**
```json
{
  "count": 42,
  "students": [
    { "id": 1, "name": "Alice", "email": "alice@school.com", "isExternal": false },
    { "id": 7, "name": "Bob",   "email": "bob@ext.com",      "isExternal": true  }
  ]
}
```

- **Error:** `400 Bad Request` / `500 Internal Server Error`

---

### 3. UpdateClassName — `PUT /api/class/:classCode`

Updates the display name of an existing class.

**Body:**
```json
{ "className": "P1 Excellence" }
```

- **Success:** `204 No Content`
- **Error:** `400 Bad Request` / `500 Internal Server Error`

---

### 4. WorkloadReport — `GET /api/reports/workload`

Returns each teacher's teaching workload grouped by subject.

**Response `200`:**
```json
{
  "Teacher One": [
    { "subjectCode": "MATHS", "subjectName": "Mathematics", "numberOfClasses": 3 }
  ],
  "Teacher Two": [
    { "subjectCode": "ENG", "subjectName": "English", "numberOfClasses": 1 }
  ]
}
```

- **Error:** `500 Internal Server Error`

---

### Healthcheck — `GET /api/healthcheck`

Returns `200 OK` when the server is running.

## Running Tests

```bash
npm test
```

Tests use Jest + ts-jest. All services are tested with mocked dependencies
(no live database or network required).
