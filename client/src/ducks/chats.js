const SET_CHAT = "@peepr/ducks/chat/SET_CHAT";
const UPDATE_CHAT = "@peepr/ducks/chat/UPDATE_CHAT";
const DELETE_CHAT = "@peepr/ducks/chat/DELETE_CHAT";
const ADD_MESSAGE = "@peepr/ducks/chat/ADD_MESSAGE";

const initialState = {};
export default (state = initialState, action) => {
	const { type, payload } = action;

	switch (type) {
		case SET_CHAT:
			return {
				...state,
				[payload.username]: {
					...payload,
				},
			};
		case UPDATE_CHAT:
			if (!state[payload.username]) return state;
			return {
				...state,
				[payload.username]: {
					...state[payload.username],
					...payload,
				},
			};
		case DELETE_CHAT:
			const { [payload.username]: omit, ...restState } = state;
			return restState;
		case ADD_MESSAGE:
			const { username, message } = payload;
			const chat = state[username];
			return {
				...state,
				[username]: {
					...chat,
					messages: chat.messages.concat(message),
				},
			};
		default:
			return state;
	}
};

export const actions = {
	setChat: (payload) => ({ type: SET_CHAT, payload }),
	updateChat: (payload) => ({ type: UPDATE_CHAT, payload }),
	deleteChat: (payload) => ({ type: DELETE_CHAT, payload }),
	addMessage: (payload) => ({ type: ADD_MESSAGE, payload }),
};
