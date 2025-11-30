import ngrok from "ngrok";
import fs from "fs";
import path from "path";

// Start ngrok on port 3000
async function startNgrok() {
  const url = await ngrok.connect({
    addr: 3000,
    authtoken: process.env.NGROK_AUTH_TOKEN, // Your auth token
  });

  console.log("NGROK URL:", url);

  // Path to .env
  const envPath = path.resolve(process.cwd(), ".env");
  let envContent = fs.readFileSync(envPath, "utf-8");

  // Update BASE_URL in .env
  envContent = envContent.replace(
    /BASE_URL=.*/g,
    `BASE_URL=${url}`
  );

  fs.writeFileSync(envPath, envContent);
  console.log("Updated .env with new NGROK URL:", url);

  // Restart backend automatically
  console.log("Restarting backend...");
}

startNgrok();
