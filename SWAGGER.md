# School Administration System API Documentation

## Overview

The School Administration System API provides endpoints for managing students, classes, teachers, and generating reports in a school environment. The API is built with Express.js and TypeScript, using a MySQL database with Sequelize ORM.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.school.example.com`

## API Documentation

The interactive Swagger UI is available at `/api-docs` when the server is running.

```bash
npm run start:dev
# Visit: http://localhost:3000/api-docs
```

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

---

## Endpoints

### Health Check

#### GET /healthcheck

Check if the server is running and healthy.

**Response:**

- **Status Code**: `200 OK`
- **Body**: Empty

**Example:**

```bash
curl -X GET http://localhost:3000/api/healthcheck
```

---

### Data Import

#### POST /upload

Import student, class, and teacher data from a CSV file.

**Request:**

- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Field Name**: `data` (CSV file)

**CSV Format:**

The CSV file must contain the following columns (case-sensitive):

| Column         | Type   | Required | Description                                               |
| -------------- | ------ | -------- | --------------------------------------------------------- |
| `teacherEmail` | string | Yes      | Email address of the teacher                              |
| `teacherName`  | string | Yes      | Full name of the teacher                                  |
| `studentEmail` | string | Yes      | Email address of the student (must be unique)             |
| `studentName`  | string | Yes      | Full name of the student                                  |
| `classCode`    | string | Yes      | Unique identifier for the class                           |
| `classname`    | string | Yes      | Human-readable class name                                 |
| `subjectCode`  | string | Yes      | Code identifying the subject                              |
| `subjectName`  | string | Yes      | Name of the subject                                       |
| `toDelete`     | string | No       | Set to "true" to delete the record instead of creating it |

**Example CSV:**

```csv
teacherEmail,teacherName,studentEmail,studentName,classCode,classname,subjectCode,subjectName,toDelete
teacher1@school.com,John Smith,student1@school.com,Alice Johnson,CLASS-001,10th Grade - A,MATH-101,Mathematics,
teacher1@school.com,John Smith,student2@school.com,Bob Wilson,CLASS-001,10th Grade - A,MATH-101,Mathematics,
teacher2@school.com,Jane Doe,student3@school.com,Carol Brown,CLASS-001,10th Grade - A,ENG-101,English,
```

**Response:**

- **Status Code**: `204 No Content` (on success)

**Error Responses:**

| Status Code | Description                                                             |
| ----------- | ----------------------------------------------------------------------- |
| `400`       | Bad Request - Invalid CSV format, missing file, or binary file uploaded |
| `500`       | Internal Server Error - Processing failed                               |

**Example:**

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "data=@students.csv"
```

**Validation Rules:**

- CSV file must be a text file (not binary)
- All required columns must be present
- Email addresses must be unique per user type
- The `toDelete` column can be empty or set to "true"

---

### Students

#### GET /class/:classCode/students

Retrieve paginated list of students in a specific class.

**Request:**

- **Method**: `GET`
- **Path Parameters**:
  - `classCode` (string, required): Unique class identifier
- **Query Parameters**:
  - `offset` (integer, required): Number of records to skip (must be ≥ 0)
  - `limit` (integer, required): Number of records to return (must be > 0)

**Response:**

- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "total": 100,
    "data": [
      {
        "id": 1,
        "email": "student1@school.com",
        "name": "Alice Johnson",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "email": "student2@school.com",
        "name": "Bob Wilson",
        "createdAt": "2024-01-15T10:31:00Z",
        "updatedAt": "2024-01-15T10:31:00Z"
      }
    ]
  }
  ```

**Error Responses:**

| Status Code | Description                                      |
| ----------- | ------------------------------------------------ |
| `400`       | Bad Request - Invalid offset or limit parameters |
| `404`       | Not Found - Class does not exist                 |
| `500`       | Internal Server Error                            |

**Example:**

```bash
# Get first 10 students in class CLASS-001
curl -X GET "http://localhost:3000/api/class/CLASS-001/students?offset=0&limit=10"

# Get next 10 students
curl -X GET "http://localhost:3000/api/class/CLASS-001/students?offset=10&limit=10"
```

---

### Classes

#### PUT /class/:classCode

Update the name of a specific class.

**Request:**

- **Method**: `PUT`
- **Path Parameters**:
  - `classCode` (string, required): Unique class identifier
- **Body**:
  ```json
  {
    "className": "10th Grade - Section B"
  }
  ```

**Response:**

- **Status Code**: `204 No Content` (on success)

**Error Responses:**

| Status Code | Description                                |
| ----------- | ------------------------------------------ |
| `400`       | Bad Request - Missing or invalid className |
| `404`       | Not Found - Class does not exist           |
| `500`       | Internal Server Error                      |

**Example:**

```bash
curl -X PUT http://localhost:3000/api/class/CLASS-001 \
  -H "Content-Type: application/json" \
  -d '{"className": "10th Grade - Section B"}'
```

**Validation Rules:**

- `className` must be a non-empty string
- Whitespace is automatically trimmed

---

### Reports

#### GET /reports/workload

Generate a workload report showing all teachers and their class assignments.

**Request:**

- **Method**: `GET`

**Response:**

- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "teachers": [
      {
        "email": "teacher1@school.com",
        "name": "John Smith",
        "totalClasses": 2,
        "assignments": [
          {
            "teacherEmail": "teacher1@school.com",
            "teacherName": "John Smith",
            "subjectCode": "MATH-101",
            "subjectName": "Mathematics",
            "classCode": "CLASS-001"
          },
          {
            "teacherEmail": "teacher1@school.com",
            "teacherName": "John Smith",
            "subjectCode": "MATH-101",
            "subjectName": "Mathematics",
            "classCode": "CLASS-002"
          }
        ]
      }
    ]
  }
  ```

**Error Responses:**

| Status Code | Description           |
| ----------- | --------------------- |
| `500`       | Internal Server Error |

**Example:**

```bash
curl -X GET http://localhost:3000/api/reports/workload
```

---

## Data Models

### Student

```typescript
{
  id: number; // Unique identifier (auto-incremented)
  email: string; // Unique email address
  name: string; // Student full name
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
```

### SchoolClass

```typescript
{
  id: number; // Unique identifier (auto-incremented)
  classCode: string; // Unique class code
  className: string; // Human-readable class name
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
```

### Teacher

```typescript
{
  email: string; // Unique email address
  name: string; // Teacher full name
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
```

### Subject

```typescript
{
  code: string; // Unique subject code
  name: string; // Subject name
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
```

### TeachingAssignment

```typescript
{
  id: number; // Unique identifier
  teacherEmail: string; // Email of assigned teacher
  subjectCode: string; // Code of subject being taught
  classCode: string; // Code of class
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
```

---

## Error Handling

All error responses follow a standard format:

```json
{
  "statusCode": 400,
  "message": "Query param \"offset\" must be a non-negative integer",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common HTTP Status Codes

| Status Code | Meaning                                                |
| ----------- | ------------------------------------------------------ |
| `200`       | OK - Request succeeded                                 |
| `204`       | No Content - Request succeeded with no response body   |
| `400`       | Bad Request - Invalid input or missing required fields |
| `404`       | Not Found - Resource does not exist                    |
| `413`       | Payload Too Large - Uploaded file is too large         |
| `500`       | Internal Server Error - Server encountered an error    |

---

## Rate Limiting

Currently, there is no rate limiting implemented. It is recommended to implement rate limiting for production environments.

---

## CORS

CORS is enabled for all origins. Requests from any domain are accepted.

---

## Running the Server

### Development

```bash
# Install dependencies
npm install

# Start services (Docker)
npm run start:services

# Start server in development mode with hot reload
npm run start:dev

# API available at: http://localhost:3000/api
# Swagger UI available at: http://localhost:3000/api-docs
```

### Production

```bash
# Build TypeScript
npm run build:ts

# Start production server
npm start

# API available at: https://api.school.example.com/api
```

---

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test ClassService.test.ts
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=school_db
DB_USER=root
DB_PASSWORD=password
```

---

## Database Schema

See [database/DDL.sql](database/DDL.sql) for the complete database schema.

### Tables

- `students` - Student records
- `classes` - Class records
- `teachers` - Teacher records
- `subjects` - Subject records
- `teaching_assignments` - Teacher-Subject-Class assignments

---

## Pagination

For endpoints that support pagination (e.g., GET /class/:classCode/students), use the `offset` and `limit` query parameters:

- **offset**: Number of records to skip (0-indexed)
- **limit**: Maximum number of records to return (must be > 0)

Example: `GET /class/CLASS-001/students?offset=0&limit=10` returns the first 10 students.

---

## CSV Import Behavior

When importing CSV data:

1. **Create**: If `toDelete` is empty or not "true", a new record is created or existing one is updated
2. **Delete**: If `toDelete` is "true", the corresponding record is deleted
3. **Validation**:
   - Email addresses must be unique within their entity type
   - Class codes and subject codes are validated
   - All required fields must be present

---

## Support

For issues or questions, please refer to the project documentation or contact the development team.
