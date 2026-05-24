export interface ExternalStudent {
  id: number;
  name: string;
  email: string;
}

export interface ExternalStudentResponse {
  count: number;
  students: ExternalStudent[];
}
