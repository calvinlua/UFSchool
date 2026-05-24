import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "School Administration System API",
      version: "1.0.0",
      description:
        "API documentation for the School Administration System. This system allows School administrators and Teachers to perform administrative functions on their students.",
      contact: {
        name: "School Administration",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Development server",
      },
      {
        url: "https://api.school.example.com",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Health check endpoints",
      },
      {
        name: "Data Import",
        description: "CSV data import endpoints",
      },
      {
        name: "Students",
        description: "Student management endpoints",
      },
      {
        name: "Classes",
        description: "Class management endpoints",
      },
      {
        name: "Reports",
        description: "Report generation endpoints",
      },
    ],
    components: {
      schemas: {
        Student: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
              description: "Unique student identifier",
            },
            email: {
              type: "string",
              format: "email",
              example: "john.doe@example.com",
              description: "Student email address (unique)",
            },
            name: {
              type: "string",
              example: "John Doe",
              description: "Student full name",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when student was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when student was last updated",
            },
          },
          required: ["id", "email", "name"],
        },
        PaginatedStudentResponse: {
          type: "object",
          properties: {
            total: {
              type: "integer",
              example: 100,
              description: "Total number of students in the class",
            },
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Student",
              },
              description: "Array of student objects",
            },
          },
          required: ["total", "data"],
        },
        SchoolClass: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
              description: "Unique class identifier",
            },
            classCode: {
              type: "string",
              example: "CLASS-001",
              description: "Unique class code",
            },
            className: {
              type: "string",
              example: "10th Grade - Section A",
              description: "Human-readable class name",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when class was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when class was last updated",
            },
          },
          required: ["id", "classCode", "className"],
        },
        UpdateClassNameRequest: {
          type: "object",
          properties: {
            className: {
              type: "string",
              example: "10th Grade - Section B",
              description: "New class name",
            },
          },
          required: ["className"],
        },
        TeacherAssignment: {
          type: "object",
          properties: {
            teacherEmail: {
              type: "string",
              format: "email",
              example: "teacher@example.com",
              description: "Email of the teacher",
            },
            teacherName: {
              type: "string",
              example: "Jane Smith",
              description: "Full name of the teacher",
            },
            subjectCode: {
              type: "string",
              example: "MATH-101",
              description: "Code of the subject being taught",
            },
            subjectName: {
              type: "string",
              example: "Mathematics",
              description: "Name of the subject being taught",
            },
            classCode: {
              type: "string",
              example: "CLASS-001",
              description: "Code of the class",
            },
          },
        },
        WorkloadReport: {
          type: "object",
          properties: {
            teachers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                  },
                  name: {
                    type: "string",
                  },
                  totalClasses: {
                    type: "integer",
                  },
                  assignments: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/TeacherAssignment",
                    },
                  },
                },
              },
              description: "Array of teachers with their workload",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            statusCode: {
              type: "integer",
              example: 400,
              description: "HTTP status code",
            },
            message: {
              type: "string",
              example: "Bad Request",
              description: "Error message",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Timestamp when error occurred",
            },
          },
          required: ["statusCode", "message"],
        },
      },
      responses: {
        BadRequest: {
          description: "Bad Request - Invalid input",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        NotFound: {
          description: "Not Found - Resource does not exist",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        InternalServerError: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
