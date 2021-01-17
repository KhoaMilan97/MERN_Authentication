import ACTIONS from "../actions/actionTypes";

const initialStates = {
  user: [],
  isLogged: false,
  isAdmin: false,
};

const authReducer = (state = initialStates, action) => {
  switch (action.type) {
    case ACTIONS.LOGIN:
      return {
        ...state,
        isLogged: true,
      };
    case ACTIONS.GET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAdmin: action.payload.isAdmin,
      };

    default:
      return state;
  }
};

export default authReducer;
