import ACTIONS from "./actionTypes";

export const getToken = (token) => ({
  type: ACTIONS.GET_TOKEN,
  payload: token,
});
