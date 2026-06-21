import type { User } from "@/types";

const MOCK_USER: User = {
  id: "emp-001",
  name: "Alex Johnson",
  email: "demo@company.com",
  employeeId: "EMP-2024-001",
  department: "Sales",
  role: "Senior Sales Executive",
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const authService = {
  login: async (
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> => {
    await delay(1200);
    if (email === "demo@company.com" && password === "123456") {
      return {
        user: MOCK_USER,
        token: "mock-jwt-token-" + Date.now(),
      };
    }
    throw new Error("Invalid credentials. Use demo@company.com / 123456");
  },

  logout: async (): Promise<void> => {
    await delay(300);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await delay(800);
    if (!email.includes("@")) {
      throw new Error("Invalid email address");
    }
  },

  getProfile: async (): Promise<User> => {
    await delay(400);
    return MOCK_USER;
  },
};
