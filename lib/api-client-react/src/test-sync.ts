import { insertCallLogs, setBaseUrl, setAuthTokenGetter, setLogCredentials } from "./index";

async function main() {
  console.log("Starting test-sync script...");

  // Set the base URL to the remote backend
  setBaseUrl("https://demo.bytelinkup.com");

  // Set credentials like a dummy organization and user
  setLogCredentials("org_dummy_123", "user_dummy_123");

  // Set a mock JWT token
  setAuthTokenGetter(() => "mocked_jwt_token_value_abc123");

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
    const result = await insertCallLogs(mockPayload);
    console.log("Result:", result);
  } catch (err: any) {
    console.error("Caught expected/unexpected error:", err);
  }
}

main().catch(console.error);
