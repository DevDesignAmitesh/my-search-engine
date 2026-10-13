import fs from "fs";
import path from "path";

const TOPIC_DIR = path.join(__dirname, "events");

fs.mkdirSync(TOPIC_DIR, { recursive: true });

export function get() {
  const finalPath = path.join(TOPIC_DIR, "index-event.json");
  return fs.readFileSync(finalPath).toString();
}

export async function push(payload: { id: string; host: string; url: string }) {
  const finalPath = path.join(TOPIC_DIR, "index-event.json");

  fs.writeFileSync(finalPath, JSON.stringify(payload));
}
