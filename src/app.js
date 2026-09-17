const cors = require("cors");
const morgan = require("morgan");
const express = require("express");

const env = require("./config/env");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");
const { UPLOAD_DIR } = require("./middleware/upload.middleware");

const app = express();

app.use(
  cors({
    origin: env.corsOrigin.includes("*") ? true : env.corsOrigin,
  })
);
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/uploads", express.static(UPLOAD_DIR));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
