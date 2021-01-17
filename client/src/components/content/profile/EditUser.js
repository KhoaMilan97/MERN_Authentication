import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";

import {
  showErrMsg,
  showSuccessMsg,
} from "../../utils/notification/Notification";

const EditUser = () => {
  const { token, users } = useSelector((state) => ({ ...state }));
  const { id } = useParams();
  const history = useHistory();
  const [usersEdit, setUsersEdit] = useState([]);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [checkAdmin, setCheckAdmin] = useState(false);
  const [num, setNum] = useState(0);

  useEffect(() => {
    if (users.length !== 0) {
      users.forEach((user) => {
        if (user._id === id) {
          setUsersEdit(user);
          setCheckAdmin(user.role === 1 ? true : false);
        }
      });
    } else {
      history.push("/profile");
    }
  }, [users, id, history]);

  const handleUpdate = async () => {
    try {
      if (num % 2 !== 0) {
        const res = await axios.patch(
          `/user/update-role/${usersEdit._id}`,
          { role: checkAdmin ? 1 : 0 },
          { headers: { Authorization: token } }
        );
        setSuccess(res.data.msg);
      }
    } catch (err) {
      err.response.data.msg && setErr(err.response.data.msg);
    }
  };

  const handleCheck = () => {
    setErr("");
    setSuccess("");
    setCheckAdmin(!checkAdmin);
    setNum(num + 1);
  };

  return (
    <div className="profile_page edit_user">
      <div className="row">
        <button onClick={() => history.goBack()} className="go_back">
          <i className="fas fa-long-arrow-alt-left"></i> Go Back
        </button>
      </div>

      <div className="col-left">
        <h2>Edit User</h2>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            defaultValue={usersEdit.name}
            disabled
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={usersEdit.email}
            disabled
          />
        </div>

        <div className="form-group">
          <input
            type="checkbox"
            id="isAdmin"
            checked={checkAdmin}
            onChange={handleCheck}
          />
          <label htmlFor="isAdmin">isAdmin</label>
        </div>

        <button onClick={handleUpdate}>Update</button>

        {err && showErrMsg(err)}
        {success && showSuccessMsg(success)}
      </div>
    </div>
  );
};

export default EditUser;
