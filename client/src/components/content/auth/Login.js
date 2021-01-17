import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "react-google-login";
import FacebookLogin from "react-facebook-login";

import {
  showSuccessMsg,
  showErrMsg,
} from "../../utils/notification/Notification";
import { dispatchLogin } from "../../../redux/actions/authAction";

const initialState = {
  email: "",
  password: "",
  err: "",
  success: "",
};

const Login = () => {
  const [user, setUser] = useState(initialState);
  const { email, password, err, success } = user;
  const dispatch = useDispatch();
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser({
      ...user,
      [name]: value,
      err: "",
      success: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/user/login", { email, password });
      setUser({ ...user, err: "", success: res.data.msg });

      localStorage.setItem("firstLogin", true);
      dispatch(dispatchLogin());

      history.push("/");
    } catch (err) {
      err.response.data.msg &&
        setUser({ ...user, err: err.response.data.msg, success: "" });
    }
  };

  const responseGoogle = async (response) => {
    try {
      const res = await axios.post("/user/google-login", {
        tokenId: response.tokenId,
      });
      setUser({ ...user, err: "", success: res.data.msg });
      localStorage.setItem("firstLogin", true);
      dispatch(dispatchLogin());

      history.push("/");
    } catch (err) {
      err.response.data.msg &&
        setUser({ ...user, err: err.response.data.msg, success: "" });
    }
  };

  const responseFacebook = async (response) => {
    const { userID, accessToken } = response;
    try {
      const res = await axios.post("/user/facebook-login", {
        userID,
        accessToken,
      });
      setUser({ ...user, err: "", success: res.data.msg });
      localStorage.setItem("firstLogin", true);
      dispatch(dispatchLogin());

      history.push("/");
    } catch (err) {
      err.response.data.msg &&
        setUser({ ...user, err: err.response.data.msg, success: "" });
    }
  };

  return (
    <div className="login_page">
      <h2>Login</h2>
      {err && showErrMsg(err)}
      {success && showSuccessMsg(success)}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            value={email}
            onChange={handleChange}
            name="email"
            placeholder="Enter email address"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            value={password}
            onChange={handleChange}
            name="password"
            placeholder="Enter password"
          />
        </div>
        <div className="row">
          <button type="submit">Login</button>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <p>
          You don't have account? <Link to="/register">Register</Link>
        </p>
      </form>

      <div className="hr">Or Login With</div>

      <div className="social">
        <GoogleLogin
          clientId="2760912472-fr51hqmif3lt9lpd9onrg8tveuvql3ni.apps.googleusercontent.com"
          buttonText="Login with google"
          onSuccess={responseGoogle}
          cookiePolicy={"single_host_origin"}
        />

        <FacebookLogin
          appId="404917737258929"
          autoLoad={false}
          fields="name,email,picture"
          callback={responseFacebook}
        />
      </div>
    </div>
  );
};

export default Login;
