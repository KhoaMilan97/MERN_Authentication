import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  showErrMsg,
  showSuccessMsg,
} from "../../utils/notification/Notification";
import { lengthPassword, isMatch } from "../../utils/validation/Validation";
import { fetchUsers } from "../../../redux/actions/userAction";

const initialState = {
  name: "",
  password: "",
  confirmPassword: "",
  err: "",
  success: "",
};

const Profile = () => {
  const [data, setData] = useState(initialState);
  const [avatar, setAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [callback, setCallback] = useState(false);

  const auth = useSelector((state) => state.auth);
  const token = useSelector((state) => state.token);
  const users = useSelector((state) => state.users);
  const { user, isAdmin } = auth;
  const { name, password, confirmPassword, err, success } = data;
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchUsers(token));
    }
  }, [isAdmin, dispatch, token, callback]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
      err: "",
      success: "",
    });
  };

  const changeAvatar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const file = e.target.files[0];
      if (!file)
        return setData({ ...data, err: "No files uploaded.", success: "" });
      if (file.size > 1024 * 1024)
        return setData({ ...data, err: "Size too large.", success: "" });
      if (file.type !== "image/jpeg" && file.type !== "image/png")
        return setData({ ...data, err: "File format incorret.", success: "" });

      let formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/upload-avatar", formData, {
        headers: {
          "content-type": "multipart/form-data",
          Authorization: token,
        },
      });

      setLoading(false);
      setAvatar(res.data.url);
    } catch (err) {
      setLoading(false);
      err.response.data.msg &&
        setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };

  const updateUserInfo = async () => {
    try {
      const res = await axios.patch(
        "/user/update",
        {
          name: name ? name : user.name,
          avatar: avatar ? avatar : user.avatar,
        },
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

  const updatePassword = async () => {
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

  const handleUpdate = async () => {
    if (name || avatar) await updateUserInfo();
    if (password) await updatePassword();
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      if (user._id !== id) {
        if (window.confirm("Are you sure you want delete this account?")) {
          const res = await axios.delete(`/user/delete-user/${id}`, {
            headers: {
              Authorization: token,
            },
          });
          setData({ ...data, err: "", success: res.data.msg });
          setLoading(false);
          setCallback(!callback);
        }
      } else {
        setLoading(false);
        setData({
          ...data,
          err: "You can't delete this account",
          success: "",
        });
      }
    } catch (err) {
      setLoading(false);
      err.response.data.msg &&
        setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };

  return (
    <>
      <div>
        {err && showErrMsg(err)}
        {success && showSuccessMsg(success)}
        {loading && <h3>Loading...</h3>}
      </div>
      <div className="profile_page">
        <div className="col-left">
          <h2>{isAdmin ? "Admin Profile" : "User Profile"}</h2>
          <div className="avatar">
            <img src={avatar ? avatar : user.avatar} alt={user.name} />
            <span>
              <i className="fas fa-camera"></i>
              <p>Change</p>
              <input
                type="file"
                name="file"
                id="file_up"
                onChange={changeAvatar}
              />
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
              defaultValue={user.name}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              defaultValue={user.email}
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <em style={{ color: "crimson" }}>
              * If you update your password here, you will not be able to login
              quickly using google and facebook.
            </em>
          </div>
          <button onClick={handleUpdate}>Update</button>
        </div>
        <div className="col-right">
          <h2>{isAdmin ? "Users" : "My orders"}</h2>

          <div style={{ overflowX: "auto" }}>
            <table className="customers">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Admin</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.role === 1 ? (
                        <i className="fas fa-check" title="Admin"></i>
                      ) : (
                        <i className="fas fa-times" title="User"></i>
                      )}
                    </td>
                    <td>
                      <Link to={`/edit-user/${user._id}`}>
                        <i className="fas fa-edit" title="Edit"></i>
                      </Link>
                      <i
                        className="fas fa-trash-alt"
                        onClick={() => handleDelete(user._id)}
                        title="Remove"
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
