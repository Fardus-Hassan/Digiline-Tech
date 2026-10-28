import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { UPLOAD_DIR } from "./config/uploads.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/error.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.use(
  "/uploads",
  express.static(UPLOAD_DIR, {
    dotfiles: "ignore",
    index: false,
    immutable: true,
    maxAge: "365d",
    setHeaders(res, filePath) {
      // Uploaded SVGs are untrusted markup: never let them run scripts
      if (filePath.endsWith(".svg")) res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    },
  }),
);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);
