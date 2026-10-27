import { login as apiLogin, selectOrganization as apiSelectOrganization } from "@workspace/api-client-react";
import type { LoginResponse, SelectOrganizationResponse } from "@workspace/api-client-react";

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiLogin({ email, password });
      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }
      return response;
    } catch (error) {
      console.error("Login API Error:", error);
      throw error;
    }
  },

  selectOrganization: async (userId: string, orgId: string): Promise<SelectOrganizationResponse> => {
    try {
      const response = await apiSelectOrganization({ userId, orgId });
      if (!response.success) {
        throw new Error("Organization selection failed");
      }
      return response;
    } catch (error) {
      console.error("Select Organization API Error:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    // No backend call needed for logout currently, we just clear client state.
    return Promise.resolve();
  },

  forgotPassword: async (email: string): Promise<void> => {
    // Return mock success for forgot password
    if (!email.includes("@")) {
      throw new Error("Invalid email address");
    }
    return Promise.resolve();
  },
};
