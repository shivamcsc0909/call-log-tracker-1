import { Router } from "express";
import { InsertCallLogsBody } from "@workspace/api-zod";

const router = Router();

router.post("/logs/call", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing or invalid token"
      });
    }

    const body = InsertCallLogsBody.parse(req.body);
    console.log(`[API Server] Received ${body.logs.length} call logs from client.`);
    
    return res.json({
      success: true,
      message: "Logs synchronized successfully"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Bad Request"
    });
  }
});

export default router;
