import express from "express";
import cors from "cors";
import { hostManager } from "./host-manager";
import { normalizeURLFn } from "./url-normalizer";
import { crawlerLoop } from "./crawlerLoop";
import { indexerManager } from "./index-manager";

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

app.post("/submit-url", (req, res) => {
  const { url } = req.body;

  // todo: normalize url
  const normaliedUrl = normalizeURLFn(url);

  if (!normaliedUrl) {
    res.status(403).json({ message: "invalid-url" });
    return;
  }

  // check if its already existing
  const existingUrl = hostManager.checkExistingUrl({ url: normaliedUrl });

  if (existingUrl) {
    res.status(403).json({ message: "url already exists" });
    return;
  }

  // add this url in the host's queue
  hostManager.addUrlToHosts(normaliedUrl);

  // fire and forgot
  crawlerLoop();

  res.status(200).json({ message: "url accepted for crawing" });
});

app.get("/search", (req, res) => {
  const { query } = req.query;

  if (typeof query !== "string" || query.length < 0) {
    res.status(403).json({ message: "invalid input" });
    return;
  }

  const suggestions = indexerManager.search(query);

  return res.status(200).json({ suggestions });
});

app.listen(port, () => console.log("code is running at", port));
