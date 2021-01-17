import axios from "axios";
import ACTIONS from "./actionTypes";

export const dispatchGetAllUser = (res) => ({
  type: ACTIONS.GET_ALL_USER,
  payload: res.data,
});

export const fetchUsers = (token) => async (dispatch) => {
  try {
    const res = await await axios.get("/user/all-user", {
      headers: { Authorization: token },
    });
    dispatch(dispatchGetAllUser(res));
  } catch (err) {
    console.log(err);
    throw err;
  }
};
