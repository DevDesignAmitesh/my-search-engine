import fs from "fs";
import path from "path";

const TOPIC_DIR = path.join(__dirname, "events");

// Ensure topic directory exists
fs.mkdirSync(TOPIC_DIR, { recursive: true });

export function subscribe() {
  return new Promise<{ data: string }>((res) => {
    console.log("RUNNING");

    // Subscriber: watch directory for new message files
    fs.watch(TOPIC_DIR, (eventType, filename) => {
      if (eventType === "rename" && filename) {
        const filePath = path.join(TOPIC_DIR, filename);

        fs.readFile(filePath, "utf8", (err, data) => {
          if (!err && data) {
            console.log(`Received message from ${filename}:`, data);

            // Clean up processed message file
            fs.unlink(filePath, () => {});

            res({ data });
          }
        });
      }
    });
  });
}

// Publisher: write a message file
export function publish(payload: { id: string; host: string; url: string }) {
  console.log("calling publish with", payload.host);
  const filePath = path.join(TOPIC_DIR, "index-event.json");
  fs.writeFileSync(filePath, JSON.stringify(payload));
}
