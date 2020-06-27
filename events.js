const logger = require("./utils/logger");

const { CHAT_STATUSES } = require("./client/src/constants");

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

/*
users = {
	'dillon': {
		name: 'dillon',
		sessionId: '5sd;jasdifopjawfma;sdfjk',
		socketId: '98ja;iji9324uf',
		chats: {
			'shane': {
				user: {}, // points to shane from below
				status: CHAT_STATUSES.PENDING
			}
		}
	}
	'shane': {
		name: 'shane',
		sessionId: 'vjkljefjoijasd;lkjaef',
		socketId: 'askjha;wfhoiu;jfd',
		chats: {
			'dillon': {
				user: {}, // points to dillon from above
				status: CHAT_STATUSES.PENDING
			}
		}
	}
}
*/

module.exports = (io) => {
	io.on("connection", (socket) => {
		logger.info("new connection");
		logger.info("handshake:", socket.handshake.query);

		const name = nameGenerator();
		const user = {
			name,
			sessionId: uuidV4(),
			socketId: socket.id,
			chats: {}
		};
		users[name] = user;

		socket.emit("user", user);

		socket.on("chat_request", ({ username: otherUsername, publicKey }) => {
			console.log(`${user.name} requesting chat with ${otherUsername}`)
			const userRequested = users[otherUsername];
			console.log("userRequested", userRequested);
			if (!userRequested) {
				return socket.emit("chat_request_error", { username: otherUsername, error: "no user" });
			}
			if (user.chats[otherUsername]) {
				return socket.emit("chat_request_error", { username: otherUsername, error: "already chatting..." });
			}
			user.chats[otherUsername] = {
				user: userRequested,
				status: CHAT_STATUSES.PENDING,
			}
			users[otherUsername].chats[user.name] = {
				user,
				status: CHAT_STATUSES.PENDING,
			}

			socket.emit('chat_request_success', { username: otherUsername });
			io.to(userRequested.socketId).emit("chat_request", {
				username: user.name,
				publicKey,
			});
		});

		socket.on("chat_accept", ({ username, publicKey }) => {
			const userRequested = users[username];
			if (!userRequested) {
				return socket.emit("chat_accept_error", { username });
			}

			user.chats[username].status = CHAT_STATUSES.ACCEPTED;
			users[username].chats[user.name].status = CHAT_STATUSES.ACCEPTED;
			io.to(userRequested.socketId).emit("chat_accept", {
				username: user.name,
				publicKey,
			});
		});

		socket.on("chat_reject", ({ username }) => {
			const userRequested = users[username];
			if (!userRequested) {
				return socket.emit("chat_reject_error", { username });
			}

			delete user.chats[username]
			delete users[username].chats[user.name]
			io.to(userRequested.socketId).emit("chat_reject", {
				username: user.name,
			});
		});

		socket.on("message_send", ({ username, message }) => {
			const userRequested = users[username];
			if (!userRequested) {
				return socket.emit("message_send_error", { username });
			}
			// ensure that i'm actually in an accepted chat with that user...

			io.to(userRequested.socketId).emit("message_receive", {
				username: user.name,
				message,
			})
		});

		socket.on("disconnect", () => {
			logger.info("disconnect");
			Object.entries(users[name].chats).forEach(([key, value]) => {
				io.to(value.socketId).emit("chat_disconnect", {
					username: value.name,
				});
			});
			delete users[name];
		});
	});
};
