const SET_USER = "@peepr/ducks/user";

const initialState = {};
export default (state = initialState, action) => {
	const { type, payload } = action;

	switch (type) {
		case SET_USER:
			return payload;
		default:
			return state;
	}
};

export const actions = {
	setUser: (payload) => ({ type: SET_USER, payload }),
};
