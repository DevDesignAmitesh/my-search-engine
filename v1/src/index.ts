import express from "express";
import cors from "cors";
import { hostManager } from "./host-manager";
import { normalizeURLFn } from "./url-normalizer";
import { crawlerLoop } from "./crawlerLoop";
import { indexerManager } from "./index-manager";
import z from "zod";
import { metadataManager } from "./metadata-manager";

const querySchema = z.object({
  query: z.string(),
});

const urlSchema = z.object({
  url: z.url(),
});

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

app.post("/submit-url", (req, res) => {
  const { data, success } = urlSchema.safeParse({ url: req.body.url });

  if (!success) {
    res.status(400).json({ message: "invalid-url" });
    return;
  }

  const { url } = data;

  // todo: normalize url
  const normaliedUrl = normalizeURLFn(url);

  if (!normaliedUrl) {
    res.status(400).json({ message: "invalid-url" });
    return;
  }

  // check if its already existing
  const existingUrl = hostManager.checkExistingUrl({ url: normaliedUrl });

  if (existingUrl) {
    res.status(409).json({ message: "url already exists" });
    return;
  }

  const length = hostManager.getSize();

  if (length === 0) {
    // add this url in the host's queue
    hostManager.addUrlToHosts(normaliedUrl);
    // fire and forgot
    crawlerLoop();
  } else {
    // add this url in the host's queue
    hostManager.addUrlToHosts(normaliedUrl);
  }

  const metaData = metadataManager.getMetaDataInArray();

  res.status(200).json({ message: "url accepted for crawing", metaData });
});

app.get("/search", (req, res) => {
  const { data, success } = querySchema.safeParse({ query: req.query.query });

  if (!success) {
    res.status(400).json({ message: "invalid input" });
    return;
  }

  const { query } = data;

  const suggestions = indexerManager.search(query);

  return res.status(200).json({ suggestions });
});

app.get("/metadata", (req, res) => {
  const metaData = metadataManager.getMetaDataInArray();

  return res.json({ metaData });
});

app.listen(port, () => console.log("code is running at", port));
