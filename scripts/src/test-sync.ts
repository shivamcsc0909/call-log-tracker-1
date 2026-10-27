import { login, selectOrganization, insertCallLogs, setBaseUrl, setAuthTokenGetter, setLogCredentials } from "@workspace/api-client-react";

async function main() {
  console.log("Starting test-sync script with full auth flow...");

  // Set the base URL to the remote backend
  setBaseUrl("http://localhost:3001");

  let token = "";
  let userId = "";
  let orgId = "";

  // 1. Try Login
  try {
    console.log("--- Executing Login ---");
    const loginResult = await login({
      email: "client.test@company.com",
      password: "Test@123456"
    });
    console.log("Login Result:", JSON.stringify(loginResult, null, 2));
    userId = loginResult.data.userId;
    orgId = loginResult.data.organizations[0]?.id;
  } catch (err: any) {
    console.error("Login failed:", err);
    console.log("Trying demo@company.com credentials...");
    try {
      const loginResult = await login({
        email: "demo@company.com",
        password: "123456"
      });
      console.log("Login Result:", JSON.stringify(loginResult, null, 2));
      userId = loginResult.data.userId;
      orgId = loginResult.data.organizations[0]?.id;
    } catch (err2: any) {
      console.error("Demo login also failed:", err2);
      return;
    }
  }

  // 2. Select Organization
  try {
    console.log("--- Executing Select Organization ---");
    const selectResult = await selectOrganization({
      userId,
      orgId
    });
    console.log("Select Org Result:", JSON.stringify(selectResult, null, 2));
    token = selectResult.token;
  } catch (err: any) {
    console.error("Select Organization failed:", err);
    return;
  }

  // Set credentials for logging
  setLogCredentials(orgId, userId);
  setAuthTokenGetter(() => token);

  // 3. Test insertCallLogs with standard client format
  const mockPayload = {
    logs: [
      {
        number: "+1234567890",
        name: "Test Contact",
        duration: 120,
        timestamp: new Date().toISOString(),
        type: "incoming",
      }
    ]
  };

  try {
    console.log("--- Executing Insert Call Logs (Client Format) ---");
    const result = await insertCallLogs(mockPayload);
    console.log("Result:", result);
  } catch (err: any) {
    console.error("Caught expected/unexpected error on Client Format:", err);
  }

  // 4. Test insertCallLogs with user-mentioned format if the first fails
  const mockPayloadAlternative = {
    logs: [
      {
        callId: "call_abc_123",
        from: "+1234567890",
        to: "+0987654321",
        duration: 120,
        type: "incoming",
        university: "Acme University",
        owner: "user_12345"
      }
    ]
  } as any;

  try {
    console.log("--- Executing Insert Call Logs (User-Mentioned Format) ---");
    const result = await insertCallLogs(mockPayloadAlternative);
    console.log("Result:", result);
  } catch (err: any) {
    console.error("Caught expected/unexpected error on User Format:", err);
  }
}

main().catch(console.error);
