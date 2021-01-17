import axios from "axios";
import { useState } from "react";

import {
  showErrMsg,
  showSuccessMsg,
} from "../../utils/notification/Notification";
import { isEmail } from "../../utils/validation/Validation";

const initialState = {
  email: "",
  success: "",
  err: "",
};

const ForgotPassword = () => {
  const [data, setData] = useState(initialState);
  const { email, success, err } = data;

  const handleInputChange = (e) => {
    const { value, name } = e.target;
    setData({
      ...data,
      [name]: value,
      success: "",
      err: "",
    });
  };

  const forgotPassword = async (e) => {
    if (!isEmail(email)) {
      return setData({
        ...data,
        err: "Invalid Emails",
        success: "",
      });
    }
    try {
      const res = await axios.post("/user/forgot-password", { email });
      setData({ ...data, err: "", success: res.data.msg });
    } catch (err) {
      err.response.data.msg &&
        setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };

  return (
    <div className="fg_pass">
      <h2>Forgot ForgotPassword</h2>
      <div className="row">
        {err && showErrMsg(err)}
        {success && showSuccessMsg(success)}

        <label htmlFor="email">Enter your email address</label>
        <input
          type="email"
          name="email"
          onChange={handleInputChange}
          placeholder="Enter your email"
        />

        <button onClick={forgotPassword}>Verify Email</button>
      </div>
    </div>
  );
};

export default ForgotPassword;
