import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Toast from "toastr";
import secret from "./utils/secret";
import classnames from "classnames";

import styles from "./styles.module.scss";

const wsUrl = "http://localhost:5000";
const socket = io.connect(wsUrl);
secret.generateKeys();

function App() {
	const [search, setSearch] = useState("");
	const [isChatRequesting, setIsChatRequesting] = useState(false);
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
			setIsChatRequesting(false);
			setPeeps((prevPeeps) => [
				...prevPeeps,
				{ name: username, status: "PENDING" },
			]);
		});
		socket.on("chat_request_error", ({ username, error }) => {
			setIsChatRequesting(false);
		});
		socket.on("chat_accept", ({ username, publicKey }) => {
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
			setPeeps((prevPeeps) =>
				prevPeeps.filter(({ name }) => name != username)
			);
		});
		socket.on("message_receive", ({ username, message }) => {
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
		if (!search || isChatRequesting) return;

		setSearch("");
		setIsChatRequesting(true);
		const publicKey = secret.keyToPem();

		socket.emit("chat_request", { publicKey, username: search });
	};

	const requestBtnClasses = classnames({
		"button": true,
		"is-primary": true,
		"is-loading": isChatRequesting,
		"is-disabled": isChatRequesting,
	});
	return (
		<div className={styles.App}>
			<div>
				{user && <p>{user.name}</p>}
				<input
					className="input"
					value={search}
					placeholder="username"
					onChange={({ target: { value } }) => setSearch(value)}
				/>
				<button className={requestBtnClasses} onClick={requestChat}>request chat</button>
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
		socket.emit("message_send", {
			username: name,
			message: secret.encryptWith(message, publicKey),
		});
		setMessage("");
	};

	return (
		<div>
			<p>
				{name} {status}
			</p>
			{status === "ACCEPTED" && (
				<>
					<textarea
						className="textarea"
						value={message}
						onChange={({ target: { value } }) => setMessage(value)}
					></textarea>
					<button className="button" onClick={sendMessage}>Send message</button>
					<ul>
						{messages.map((m) => (
							<li key={m}>{m}</li>
						))}
					</ul>
				</>
			)}
		</div>
	);
}

export default App;
