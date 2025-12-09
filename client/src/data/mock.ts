import type { FrameworkUser } from "../types";

// data/mock.ts
export const mockFrameworkUser: FrameworkUser = {
  id: 1,
  client_id: 1001,
  name: "Иван Иванов",
  full_name: "Иван Иванов",
  email: "ivan.ivanov@example.com",
  phone: "+7 (999) 123-45-67",
  country: "Россия",
  status: "active", 
  streams: [],
  created_at: "2023-01-15T10:30:00Z",
  date_of_birth: "1990-05-20"
};