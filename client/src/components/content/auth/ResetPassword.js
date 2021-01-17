import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

import {
  showErrMsg,
  showSuccessMsg,
} from "../../utils/notification/Notification";
import { lengthPassword, isMatch } from "../../utils/validation/Validation";

const initialState = {
  password: "",
  confirmPassword: "",
  err: "",
  success: "",
};

const ResetPassword = () => {
  const { token } = useParams();
  const [data, setData] = useState(initialState);
  const { password, confirmPassword, success, err } = data;

  const handleInputChange = (e) => {
    const { value, name } = e.target;
    setData({
      ...data,
      [name]: value,
      success: "",
      err: "",
    });
  };

  const handleReset = async (e) => {
    if (lengthPassword(password)) {
      return setData({
        ...data,
        err: "Password must be at least 6 characters.",
        success: "",
      });
    }

    if (isMatch(password, confirmPassword)) {
      return setData({
        ...data,
        err: "Password not match.",
        success: "",
      });
    }

    try {
      const res = await axios.post(
        "/user/reset-password",
        { password },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setData({ ...data, err: "", success: res.data.msg });
    } catch (err) {
      err.response.data.msg &&
        setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };

  return (
    <div className="fg_pass">
      <h2>Reset Password</h2>
      <div className="row">
        {err && showErrMsg(err)}
        {success && showSuccessMsg(success)}

        <label htmlFor="password">Enter your password</label>
        <input type="password" name="password" onChange={handleInputChange} />

        <label htmlFor="password">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          onChange={handleInputChange}
        />

        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

export default ResetPassword;
