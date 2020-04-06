const logger = require("./utils/logger");

const {
	uniqueNamesGenerator,
	adjectives,
	colors,
	animals,
} = require("unique-names-generator");
const uuidV4 = require("uuid/v4");

const nameGenerator = () =>
	uniqueNamesGenerator({
		dictionaries: [adjectives, adjectives, colors, animals],
		length: 4,
	});

const users = {};

module.exports = (io) => {
	io.on("connection", (socket) => {
		logger.info("new connection");

		const name = nameGenerator();
		const user = {
			name,
			sessionId: uuidV4(),
			socketId: socket.id,
		};
		users[name] = user;

		socket.emit("user", user);

		socket.on("chat_new", ({ username, publicKey }) => {
			const userRequested = users[username];
			if (!userRequested) {
				socket.emit("chat_new_404", { username });
			}

			io.to(userRequested.socketId).emit("chat_request", {
				username: user.name,
				publicKey,
			});
		});

		socket.on("chat_accept", ({ username, publicKey }) => {
			const userRequested = users[username];
			if (!userRequested) {
				socket.emit("chat_accept_404", { username });
			}

			io.to(userRequested.socketId).emit("chat_accept", {
				username: user.name,
				publicKey,
			});
		});

		socket.on("chat_reject", ({ username }) => {
			const userRequested = users[username];
			if (!userRequested) {
				socket.emit("chat_reject_404", { username });
			}

			io.to(userRequested.socketId).emit("chat_reject", {
				username: user.name,
			});
		});

		socket.on("disconnect", () => {
			logger.info("disconnected");
			delete users[name];
		});
	});
};
