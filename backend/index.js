import express from "express";
import bodyParser from "body-parser";
import { create } from "venom-bot";

const app = express();
app.use(bodyParser.json());

let whatsappClient;

create({
  session: "my-session",
  multidevice: true,
  headless: true,
  browserArgs: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-first-run",
    "--no-zygote",
    "--single-process",
    "--disable-extensions",
    "--remote-debugging-port=9222",
    "--headless=new", // Important fix for Chrome 112+
  ],
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Adjust if Chrome is installed elsewhere
})
  .then((client) => {
    whatsappClient = client;
    console.log("✅ WhatsApp client is ready!");

    // Auto-reply logic
    client.onMessage((message) => {
      if (message.body === "hi") {
        client.sendText(message.from, "Hello 👋");
      }
    });
  })
  .catch((error) => {
    console.error("❌ Error starting venom client:", error);
  });

// Schedule WhatsApp message
app.post("/schedule", (req, res) => {
  const { phone, message, time } = req.body;

  const sendTime = new Date(time);
  const delay = sendTime.getTime() - Date.now();

  if (delay <= 0) {
    return res.status(400).send("Time must be in the future");
  }

  setTimeout(() => {
    if (!whatsappClient) {
      console.error("WhatsApp client not initialized");
      return;
    }

    whatsappClient
      .sendText(`${phone}@c.us`, message)
      .then(() => console.log("Message sent to", phone))
      .catch((err) => console.error("Failed to send", err));
  }, delay);

  res.send("Message scheduled successfully");
});

// Start server
app.listen(3000, () => console.log("Server started on http://localhost:3000"));
