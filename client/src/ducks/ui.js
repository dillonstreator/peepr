const SET_REQUEST_CHAT_IN_PROGRESS =
	"@peepr/ducks/ui/SET_REQUEST_CHAT_IN_PROGRESS";

const initialState = {
	isChatRequestInProgress: false,
};
export default (state = initialState, action) => {
	const { type, payload } = action;

	switch (type) {
		case SET_REQUEST_CHAT_IN_PROGRESS:
			return {
				...state,
				isChatRequestInProgress: payload,
			};
		default:
			return state;
	}
};

export const actions = {
	setRequestChatInProgress: (payload) => ({ type: SET_REQUEST_CHAT_IN_PROGRESS, payload }),
};
