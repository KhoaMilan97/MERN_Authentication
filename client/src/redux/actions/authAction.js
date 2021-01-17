import axios from "axios";
import ACTIONS from "./actionTypes";

export const dispatchLogin = () => ({
  type: ACTIONS.LOGIN,
});

export const fetchUser = async (token) => {
  const res = await axios.get("/user/user-infor", {
    headers: { Authorization: token },
  });

  return res;
};

export const dispatchGetUser = (res) => ({
  type: ACTIONS.GET_USER,
  payload: {
    user: res.data,
    isAdmin: res.data.role === 1 ? true : false,
  },
});
