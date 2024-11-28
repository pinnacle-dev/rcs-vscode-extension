import { PinnacleClient } from "rcs-js";

export async function sendRCS(apiKey: string, json: any) {
  try {
    console.log("RCSSend: Starting to send RCS message");
    console.log(
      "RCSSend: Creating client with API key:",
      apiKey ? "present" : "missing"
    );

    // Validate that json is a single object, not an array
    if (Array.isArray(json)) {
      console.log("ERROR here");
      throw new Error("RCS payload must be a single JSON object, not an array");
    }

    const client = new PinnacleClient({ apiKey });
    console.log("RCSSend: Client created successfully");
    console.log("RCSSend: Sending RCS message with payload:", json);

    const response = await client.send.rcs(json);
    console.log("RCSSend: Response received:", response);
    return response;
  } catch (error) {
    console.error("RCSSend: Error sending RCS message:", error);
    throw error;
  }
}
