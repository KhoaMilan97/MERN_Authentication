import ACTIONS from "../actions/actionTypes";

const users = [];

const userReducer = (state = users, action) => {
  switch (action.type) {
    case ACTIONS.GET_ALL_USER:
      return action.payload;
    default:
      return state;
  }
};

export default userReducer;
