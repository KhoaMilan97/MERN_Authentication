import { combineReducers } from "redux";

import authReducer from "./authReducer";
import tokenReducer from "./tokenReducer";
import userReducer from "./userReducer";

export default combineReducers({
  auth: authReducer,
  token: tokenReducer,
  users: userReducer,
});
