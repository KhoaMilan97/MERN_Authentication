import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  showSuccessMsg,
  showErrMsg,
} from "../../utils/notification/Notification";
import {
  isEmpty,
  isEmail,
  isMatch,
  lengthPassword,
} from "../../utils/validation/Validation";

const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  err: "",
  success: "",
};

const Register = () => {
  const [user, setUser] = useState(initialState);
  const { name, email, password, confirmPassword, err, success } = user;

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

    // validate
    if (isEmpty(name) || isEmpty(password))
      return setUser({
        ...user,
        err: "Please fill in all fields",
        success: "",
      });
    if (!isEmail(email)) {
      return setUser({
        ...user,
        err: "Invalid Emails",
        success: "",
      });
    }

    if (lengthPassword(password)) {
      return setUser({
        ...user,
        err: "Password must be at least 6 characters.",
        success: "",
      });
    }

    if (isMatch(password, confirmPassword)) {
      return setUser({
        ...user,
        err: "Password not match.",
        success: "",
      });
    }

    try {
      const res = await axios.post("/user/register", { name, email, password });

      setUser({ ...user, err: "", success: res.data.msg });
    } catch (err) {
      err.response.data.msg &&
        setUser({ ...user, err: err.response.data.msg, success: "" });
    }
  };

  return (
    <div className="login_page">
      <h2>Register</h2>
      {err && showErrMsg(err)}
      {success && showSuccessMsg(success)}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Name</label>
          <input
            type="text"
            value={name}
            onChange={handleChange}
            name="name"
            placeholder="Enter your name"
          />
        </div>
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
        <div>
          <label htmlFor="password">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
            placeholder="Enter confirm password"
          />
        </div>
        <div className="row">
          <button type="submit">Register</button>
        </div>
        <p>
          Already account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
