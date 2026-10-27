import { Router } from "express";
import { LoginBody, SelectOrganizationBody } from "@workspace/api-zod";

const router = Router();

router.post("/banner/auth/login", (req, res) => {
  try {
    const body = LoginBody.parse(req.body);
    
    // Accept client.test@company.com / Test@123456 or demo@company.com / 123456
    if (
      (body.email === "client.test@company.com" && body.password === "Test@123456") ||
      (body.email === "demo@company.com" && body.password === "123456")
    ) {
      res.json({
        success: true,
        message: "Login successful",
        data: {
          userId: "user_12345",
          email: body.email,
          firstName: body.email === "client.test@company.com" ? "Client" : "Demo",
          lastName: "User",
          organizations: [
            { id: "org_1", name: "Acme Corp" },
            { id: "org_2", name: "Global Industries" }
          ]
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Bad Request"
    });
  }
});

router.post("/banner/auth/select-organization", (req, res) => {
  try {
    const body = SelectOrganizationBody.parse(req.body);
    
    if (body.userId === "user_12345") {
      const orgName = body.orgId === "org_1" ? "Acme Corp" : "Global Industries";
      res.json({
        success: true,
        token: "mocked_jwt_token_value_abc123",
        user: {
          id: "user_12345",
          userId: "user_12345",
          firstName: "Client",
          lastName: "Test",
          email: "client.test@company.com",
          role: "Consultant",
          department: "QA & Testing",
          employeeId: "EMP-QA-777"
        },
        organization: {
          id: body.orgId,
          name: orgName
        },
        isAdmin: false,
        permissions: ["read", "write"],
        subscriptions: ["premium"]
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Bad Request"
    });
  }
});

export default router;
