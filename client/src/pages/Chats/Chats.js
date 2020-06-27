import React, { useState } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import classnames from "classnames";
import { actions as uiActions } from "../../ducks/ui";
import socket from "../../socket";
import secret from "../../utils/secret";

import styles from './chats.module.scss';

socket.connect();
secret.generateKeys();

const Chats = ({
	user,
	chats,
	setRequestChatInProgress,
	isChatRequestInProgress,
}) => {
	const [search, setSearch] = useState("");
	const requestChat = () => {
		if (isChatRequestInProgress) return;

		setSearch("");
		setRequestChatInProgress(true);
		socket.emit.chatRequest({ username: search });
	};

	const requestBtnClasses = classnames({
		button: true,
		"is-primary": true,
		"is-loading": isChatRequestInProgress,
		"is-disabled": isChatRequestInProgress,
	});
	return (
		<div>
			{user && (
				<div className={styles.usernameWrapper}>
					<h3><span>You are</span> <code>{user.name}</code></h3>
				</div>
			)}
			<div className={styles.search}>
				<label>
					Username
				</label>
				<input
					value={search}
					onChange={({ target: { value } }) => setSearch(value)}
				/>
				<button className={requestBtnClasses} onClick={requestChat}>
					Request Chat
				</button>
			</div>
			<div className={styles.list}>
				{Object.values(chats).map(({ username }) => (
					<Link
						className={styles.item}
						key={username}
						to={`/chats/${username}`}
					>
						<code>{username}</code>
					</Link>
				))}
			</div>
		</div>
	);
};

const mapStateToProps = ({ chats, ui, user }) => ({
	user,
	chats,
	isChatRequestInProgress: ui.isChatRequestInProgress,
});

const mapDispatchToProps = (dispatch) => ({
	setRequestChatInProgress: (inProgress) =>
		dispatch(uiActions.setRequestChatInProgress(inProgress)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Chats);
