import React, { useState } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import classnames from "classnames";
import { actions as uiActions } from "../../ducks/ui";
import socket from "../../socket";
import secret from "../../utils/secret";

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
			{user && <p>{user.name}</p>}
			<input
				className="input"
				value={search}
				placeholder="username"
				onChange={({ target: { value } }) => setSearch(value)}
			/>
			<button className={requestBtnClasses} onClick={requestChat}>
				request chat
			</button>
			<div className="list is-hoverable">
				{Object.values(chats).map(({ username }) => (
					<Link
						className="list-item"
						key={username}
						to={`/chats/${username}`}
					>
						{username}
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
