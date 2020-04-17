import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Toast from "toastr";
import secret from "./utils/secret";

import styles from "./styles.module.scss";

const socket = io.connect("http://localhost:5000");
secret.generateKeys();

function App() {
	const [search, setSearch] = useState("");
	const [user, setUser] = useState();
	const [peeps, setPeeps] = useState([]);

	useEffect(() => {
		socket.on("user", setUser);
		socket.on("chat_request", ({ username, publicKey }) => {
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
					onclick: () => {
						socket.emit("chat_accept", {
							username,
							publicKey: secret.keyToPem(),
						});
						console.log(
							`You accepted a chat with ${username} and their publicKey is: ${publicKey}`
						);
						setPeeps((prevPeeps) => {
							return prevPeeps
								.filter(({ name }) => name != username)
								.concat({
									name: username,
									publicKey: secret.pemToKey(publicKey),
									status: "ACCEPTED",
									messages: [],
								});
						});
					},
				}
			);
		});
		socket.on("chat_request_success", ({ username }) => {
			setPeeps((prevPeeps) => [
				...prevPeeps,
				{ name: username, status: "PENDING" },
			]);
		});
		socket.on("chat_accept", ({ username, publicKey }) => {
			// username accepted a chat request that I sent.. They send their publicKey along as well.. let's save that
			console.log(
				`${username} accepted a chat request that I sent. Their publicKey is ${publicKey}`
			);
			setPeeps((prevPeeps) => {
				return prevPeeps
					.filter(({ name }) => name != username)
					.concat({
						name: username,
						publicKey: secret.pemToKey(publicKey),
						status: "ACCEPTED",
						messages: [],
					});
			});
		});
		socket.on("chat_reject", ({ username }) => {
			// username rejecteded a chat request that I sent..
			console.log(`${username} rejected a chat request that I sent`);
			setPeeps((prevPeeps) =>
				prevPeeps.filter(({ name }) => name != username)
			);
		});
		socket.on("message_receive", ({ username, message }) => {
			console.log(`message received from ${username}: ${message}`);
			setPeeps((prevPeeps) => {
				return prevPeeps.reduce((acc, curr) => {
					const isMessageSender = curr.name === username;
					acc = [
						...acc,
						isMessageSender
							? {
									...curr,
									messages: curr.messages.concat(
										secret.decrypt(message)
									),
							  }
							: curr,
					];
					return acc;
				}, []);
			});
		});
		socket.on("chat_disconnect", ({ username }) => {
			setPeeps((prevPeeps) =>
				prevPeeps.filter(({ name }) => name != username)
			);
		});
	}, []);

	const requestChat = () => {
		const publicKey = secret.keyToPem();

		console.log(publicKey);
		socket.emit("chat_request", { publicKey, username: search });
	};

	console.log("peeps", peeps);
	return (
		<div className={styles.App}>
			<div>
				{user && <p>{user.name}</p>}
				<input
					value={search}
					placeholder="username"
					onChange={({ target: { value } }) => setSearch(value)}
				/>
				<button onClick={requestChat}>request chat</button>
			</div>
			<PeepList peeps={peeps} />
		</div>
	);
}

function PeepList({ peeps = [] }) {
	return (
		<div>
			{peeps.map((peep) => (
				<Peep key={peep.name} {...peep} />
			))}
		</div>
	);
}

function Peep({ name, status, publicKey, messages = [] }) {
	const [message, setMessage] = useState("");

	const sendMessage = () => {
		console.log(`sending message to user ${name}: ${message}`);
		socket.emit("message_send", {
			username: name,
			message: secret.encryptWith(message, publicKey),
		});
	};

	return (
		<div>
			<p>
				{name} {status}
			</p>
			{status === "ACCEPTED" && (
				<>
					<textarea
						value={message}
						onChange={({ target: { value } }) => setMessage(value)}
					></textarea>
					<button onClick={sendMessage}>Send message</button>
					{messages.map((m) => (
						<p key={m}>{m}</p>
					))}
				</>
			)}
		</div>
	);
}

export default App;
