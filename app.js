const path = require("path");
const express = require("express");
const rTracer = require("cls-rtracer");
const helmet = require("helmet");
const cors = require("cors");
const logger = require("./utils/logger");

const app = express();

app.use(rTracer.expressMiddleware());
app.use((req, res, next) => {
   logger.info(`${req.method} ${req.url}`);
   const startHrTime = process.hrtime();
   res.on("finish", () => {
      const elapsedHrTime = process.hrtime(startHrTime);
      const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
      logger.info(`elapsed request time: ${elapsedTimeInMs}ms`);
   });
   next();
});

app.use(helmet());
app.use(cors());

app.get("/health", (_, res) => res.status(200).send("Healthy"));

if (process.env.NODE_ENV === "production") {
   app.use("/peepr", express.static(path.join(__dirname, "client", "build")));

   app.get("*", (_, res) => {
      res.sendFile(path.join(__dirname, "client", "build", "index.html"));
   });
}

module.exports = app;
