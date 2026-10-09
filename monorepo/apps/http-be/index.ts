import express from "express";
import { redisManager } from "@repo/redis-manager/client";
import cors from "cors";

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

app.post("/submit-url", async (req, res) => {
  const { url } = req.body;

  // todo: input validation

  // check if its already existing
  const isNew = await redisManager.checkAndAddUrl({ url });

  if (isNew === 0) {
    res.status(403).json({ message: "url already exists" });
    return;
  }

  await redisManager.addToCrawlerQueue({ url });

  res.status(200).json({ message: "url accepted for crawing" });
});

app.listen(port, () => console.log("code is running at", port));
