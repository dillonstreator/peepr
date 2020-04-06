const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const http = require("http");

const app = require("./app");

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
server.listen(PORT);

const io = require("socket.io")(server);
require("./events")(io);
