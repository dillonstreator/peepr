const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const http = require("http");

const app = require("./app");

const IS_PROD = process.env.NODE_ENV === "production";

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
server.listen(PORT);


let socketConfig;
if (IS_PROD) socketConfig = { path: "/peepr/socket.io" };

const io = require("socket.io")(server, socketConfig);
require("./events")(io);
