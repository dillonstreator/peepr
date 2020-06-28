import io from "socket.io-client";
import Toast from "toastr";
import store from "./store";
import secret from "./utils/secret";
import { actions as chatActions } from "./ducks/chats";
import { actions as userActions } from "./ducks/user";
import { actions as uiActions } from "./ducks/ui";
import { CHAT_STATUSES } from './constants';

const wsUrl = process.env.REACT_APP_ENVIRONMENT === "production" ? "/peepr" : "http://localhost:5000";
let socket = null;

export default {
	connect: function () {
		if (socket) return;
		socket = io.connect(wsUrl, { path: "/peepr/socket.io" });
		socket.on("user", (user) => {
			store.dispatch(userActions.setUser(user));
		});
		socket.on("chat_request", ({ username, publicKey }) => {
			let accepted = false;
			Toast.info(
				`${username} wants to chat. Click to accept.`,
				"Chat Request",
				{
					stopOnFocus: true,
					progressBar: true,
					closeButton: true,
					preventDuplicates: true,
					onCloseClick: () => {
						socket.emit("chat_reject", { username });
					},
					onHidden: () => {
						if (accepted) return;
						socket.emit("chat_reject", { username });
					},
					onclick: () => {
						accepted = true;
						socket.emit("chat_accept", {
							username,
							publicKey: secret.keyToPem(),
						});
						store.dispatch(chatActions.setChat({ username, publicKey: secret.pemToKey(publicKey), messages: [] }));
					},
				}
			);
		});
		socket.on("chat_request_success", ({ username }) => {
			store.dispatch(uiActions.setRequestChatInProgress(false));
			store.dispatch(
				chatActions.updateChat({ username, status: CHAT_STATUSES.PENDING })
			);
		});
		socket.on("chat_request_error", ({ username, error }) => {
			store.dispatch(uiActions.setRequestChatInProgress(false));
			store.dispatch(chatActions.deleteChat({ username }));
			Toast.error(error, "Chat Request Error");
		});
		socket.on("chat_accept", ({ username, publicKey }) => {
			Toast.success(`${username} accepted the chat request that you sent.`, "Chat Status");
			store.dispatch(
				chatActions.setChat({
					username,
					publicKey: secret.pemToKey(publicKey),
					status: CHAT_STATUSES.ACCEPTED,
					messages: [],
				})
			);
		});
		socket.on("chat_reject", ({ username }) => {
			Toast.warning(`${username} rejected the chat request that you sent.`, "Chat Status");
			store.dispatch(chatActions.deleteChat({ username }));
		});
		socket.on("message_receive", ({ username, message }) => {
			store.dispatch(
				chatActions.addMessage({
					username,
					message: {
						createdAt: new Date(),
						author: username,
						text: secret.decrypt(message),
					},
				})
			);
		});
		socket.on("chat_disconnect", ({ username }) => {
			store.dispatch(
				chatActions.updateChat({
					status: CHAT_STATUSES.DISCONNECTED,
				})
			);
			Toast.info(
				`${username} disconnected`,
				"User Disconnected"
			);
		});
	},
	emit: {
		chatRequest: ({ username }) => socket.emit("chat_request", { username, publicKey: secret.keyToPem() }),
		messageSend: ({ username, message }) => socket.emit("message_send", { username, message }),
	},
};
