import { BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import {
  dispatchLogin,
  fetchUser,
  dispatchGetUser,
} from "./redux/actions/authAction";
import { getToken } from "./redux/actions/tokenAction";

import Content from "./components/content/Content";
import Header from "./components/header/Header";

function App() {
  const token = useSelector((state) => state.token);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const firstLogin = localStorage.getItem("firstLogin");
    if (firstLogin) {
      const getTokenResult = async () => {
        const res = await axios.post("/user/refresh-token", {});
        dispatch(getToken(res.data.accessToken));
      };

      getTokenResult();
    }
  }, [auth.isLogged, dispatch]);

  useEffect(() => {
    if (token) {
      const getUser = () => {
        dispatch(dispatchLogin());

        return fetchUser(token).then((res) => {
          dispatch(dispatchGetUser(res));
        });
      };

      getUser();
    }
  }, [token, dispatch]);

  return (
    <Router>
      <div className="App">
        <Header />
        <Content />
      </div>
    </Router>
  );
}

export default App;
