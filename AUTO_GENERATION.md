# Auto-Generating Swagger Documentation

This guide explains how the Swagger documentation is automatically generated and stays in sync with your API code.

## Overview

The project uses **swagger-jsdoc** to parse JSDoc comments in your controller files and automatically generate OpenAPI specifications. This means:

- ✅ Documentation lives alongside your code
- ✅ It stays in sync automatically as you develop
- ✅ Changes to endpoints are reflected immediately
- ✅ No separate documentation files to maintain

## How It Works

### 1. JSDoc Comments in Controllers

Each endpoint is documented with a JSDoc comment block using the `@swagger` tag:

```typescript
/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Health Check
 *     description: Check if the server is running and healthy
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 */
const healthcheckHandler: RequestHandler = async (req, res) => {
  return res.sendStatus(StatusCodes.OK);
};
```

### 2. Swagger Configuration

The [src/config/swagger.ts](src/config/swagger.ts) file:

- Defines the base OpenAPI spec (title, version, servers, etc.)
- Points to all controller files: `apis: ["./src/controllers/*.ts"]`
- Defines reusable schemas that controllers reference

```typescript
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      /* ... */
    },
    servers: [
      /* ... */
    ],
    components: {
      schemas: {
        Student: {
          /* schema definition */
        },
        Error: {
          /* schema definition */
        },
        // ... more schemas
      },
    },
  },
  apis: ["./src/controllers/*.ts"], // ← Points to controllers
};
```

### 3. Automatic Parsing

When the server starts, swagger-jsdoc:

1. Reads all files in `src/controllers/*.ts`
2. Parses JSDoc `@swagger` blocks
3. Merges them with the base specification
4. Creates a complete OpenAPI spec
5. Serves it via `/api-docs`

## Adding New Endpoints

To add a new endpoint with auto-generated documentation:

### Step 1: Add the Endpoint Handler

```typescript
const newEndpointHandler: RequestHandler = async (req, res, next) => {
  try {
    // Your logic here
    return res.status(StatusCodes.OK).json({
      /* response */
    });
  } catch (err) {
    next(err);
  }
};

MyController.get("/new-path", newEndpointHandler);
```

### Step 2: Add JSDoc Comment Above Handler

```typescript
/**
 * @swagger
 * /new-path:
 *   get:
 *     summary: Endpoint Summary
 *     description: Detailed description of what this endpoint does
 *     tags:
 *       - YourTag
 *     parameters:
 *       - name: param1
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/YourSchema'
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourResponseSchema'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const newEndpointHandler: RequestHandler = async (req, res, next) => {
  // ...
};
```

### Step 3: Reference Schemas

Use `$ref` to reference schemas defined in [src/config/swagger.ts](src/config/swagger.ts):

```typescript
schema: $ref: "#/components/schemas/Student";
```

### Step 4: Restart Server

```bash
npm run start:dev
```

Visit `http://localhost:3000/api-docs` - the new endpoint will appear automatically!

## JSDoc Syntax Guide

### Basic Endpoint Structure

```typescript
/**
 * @swagger
 * /path:
 *   METHOD:
 *     summary: Short description
 *     description: Longer description
 *     tags:
 *       - TagName
 *     parameters: [ /* ... */ ]
 *     requestBody: { /* ... */ }
 *     responses: { /* ... */ }
 */
```

### Parameters

#### Query Parameters

```typescript
parameters:
  - name: offset
    in: query
    required: true
    schema:
      type: integer
      minimum: 0
    example: 0
```

#### Path Parameters

```typescript
parameters:
  - name: classCode
    in: path
    required: true
    schema:
      type: string
    example: CLASS-001
```

#### Header Parameters

```typescript
parameters:
  - name: Authorization
    in: header
    required: true
    schema:
      type: string
    example: Bearer token123
```

### Request Body

#### JSON Body

```typescript
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/UpdateClassNameRequest'
```

#### Multipart/Form-Data (File Upload)

```typescript
requestBody:
  required: true
  content:
    multipart/form-data:
      schema:
        type: object
        properties:
          data:
            type: string
            format: binary
        required:
          - data
```

### Responses

#### Success Response

```typescript
responses:
  200:
    description: Success message
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Student'
```

#### Error Response

```typescript
responses:
  400:
    description: Bad Request
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
```

### Using Schemas

Reference schemas defined in `swagger.ts`:

```typescript
schema: $ref: "#/components/schemas/PaginatedStudentResponse";
```

Or define inline:

```typescript
schema: type: object;
properties: name: type: string;
age: type: integer;
required: -name - age;
```

## Defining Reusable Schemas

Add schemas to `src/config/swagger.ts` that multiple endpoints use:

```typescript
components: {
  schemas: {
    Student: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        email: { type: 'string', format: 'email' },
        name: { type: 'string' },
      },
      required: ['id', 'email', 'name'],
    },
    // ... more schemas
  }
}
```

Then reference them in controllers:

```typescript
/**
 * @swagger
 * /students/1:
 *   get:
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 */
```

## Best Practices

### 1. Keep Docs Close to Code

Write JSDoc comments right above the handler function so you're reminded to keep them in sync.

### 2. Use Consistent Tags

Define all tags in `swagger.ts` and use them consistently across endpoints:

```typescript
tags: [
  { name: "Health", description: "Health check endpoints" },
  { name: "Students", description: "Student management" },
];
```

### 3. Document Error Cases

Always include common error responses:

```typescript
responses:
  200:
    description: Success
  400:
    $ref: '#/components/responses/BadRequest'
  404:
    $ref: '#/components/responses/NotFound'
  500:
    $ref: '#/components/responses/InternalServerError'
```

### 4. Use Examples

Add `example` fields to help users understand expected values:

```typescript
schema: type: string;
example: "john.doe@example.com";
```

### 5. Test Your Documentation

- Start the server: `npm run start:dev`
- Visit `http://localhost:3000/api-docs`
- Try the "Try it out" button to test endpoints
- Verify the docs match your actual API behavior

## Troubleshooting

### Documentation Not Updating

**Problem**: You added a new endpoint but it doesn't appear in Swagger UI

**Solution**:

1. Ensure the JSDoc comment uses `@swagger` tag
2. Restart the server: `npm run start:dev`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check browser console for errors

### Schema Reference Not Working

**Problem**: Schema reference shows as "unknown schema"

**Solution**:

1. Verify schema exists in `src/config/swagger.ts`
2. Check spelling of schema name (case-sensitive)
3. Use correct format: `$ref: '#/components/schemas/SchemaName'`

### JSDoc Syntax Errors

**Problem**: Swagger UI shows parsing errors

**Solution**:

1. Check YAML indentation (2 spaces, not tabs)
2. Verify the `@swagger` tag is on the first line
3. Ensure all JSDoc lines start with ` *`
4. Use [Online YAML Validator](https://www.yamllint.com/) to check syntax

## File Structure

```
src/
├── config/
│   └── swagger.ts              ← Main Swagger config & base schemas
├── controllers/
│   ├── HealthcheckController.ts
│   ├── StudentController.ts
│   ├── ClassController.ts
│   ├── DataImportController.ts
│   └── ReportController.ts     ← All controllers have JSDoc @swagger blocks
└── app.ts                      ← Serves Swagger UI at /api-docs
```

## Viewing Documentation

### Interactive Swagger UI

```
http://localhost:3000/api-docs
```

Features:

- Try API endpoints directly
- Download OpenAPI spec as JSON
- View all schemas and responses

### OpenAPI JSON

```
http://localhost:3000/api-docs.json
```

Useful for:

- Code generation
- API testing tools (Postman, Insomnia)
- Third-party integrations

### OpenAPI YAML (Static File)

```
openapi.yaml
```

Can be viewed with online viewers:

- [Swagger Editor](https://editor.swagger.io/)
- [Redoc](https://redoc.ly/)

## Additional Resources

- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [JSDoc Syntax](https://jsdoc.app/)

## Summary

The auto-generation workflow:

1. **Write endpoint** → handler function with JSDoc `@swagger` comment
2. **Define schemas** → add to `src/config/swagger.ts` if needed
3. **Restart server** → JSDoc is parsed and merged with base spec
4. **View docs** → `http://localhost:3000/api-docs` automatically updated
5. **Test endpoints** → use Swagger UI's "Try it out" button

This keeps your documentation always in sync with your code!
