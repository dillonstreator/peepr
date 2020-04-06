import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import secret from "./utils/secret";

import styles from "./styles.module.scss";

const socket = io.connect("http://localhost:5000");
secret.generateKeys();
window.__publicKey = () => secret.publicKey();

function App() {
	const [search, setSearch] = useState("");
	const [user, setUser] = useState();

	useEffect(() => {
		fetch("http://localhost:5000/health")
			.then(console.log)
			.catch(console.error);

		socket.on("user", (u) => {
			console.log(u);
			setUser(u);
		});
		socket.on("chat_request", ({ username, publicKey }) => {
			if (
				window.confirm(`Would you like to start a chat with ${username}?`)
			) {
				// Store reference to username and publicKey
				socket.emit("chat_accept", { username, publicKey: secret.pem() });
				console.log(
					`You accepted a chat with ${username} and their publicKey is: ${publicKey}`
				);
			} else {
				socket.emit("chat_reject", { username });
			}
		});
		socket.on("chat_accept", ({ username, publicKey }) => {
			// username accepted a chat request that I sent.. They send their publicKey along as well.. let's save that
			console.log(
				`${username} accepted a chat request that I sent. Their publicKey is ${publicKey}`
			);
		});
		socket.on("chat_rejected", ({ username, publicKey }) => {
			// username rejecteded a chat request that I sent..
			console.log(`${username} rejected a chat request that I sent`);
		});
	}, []);

	const requestChat = () => {
		const publicKey = secret.pem();

		console.log(publicKey);
		socket.emit("chat_new", { publicKey, username: search });
	};

	return (
		<div className={styles.App}>
			<div>
				<input
					value={search}
					placeholder="username"
					onChange={({ target: { value } }) => setSearch(value)}
				/>
				<button onClick={requestChat}>request chat</button>
			</div>
		</div>
	);
}

export default App;
