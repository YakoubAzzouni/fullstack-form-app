import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  age: number;
  phone: string;
  city: string;
};

type ProfileProps = {
  onLogout: () => void;
};

export default function Profile({ onLogout }: ProfileProps) {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm<ProfileForm>();
  const token = localStorage.getItem("token");

  useEffect(() => {
  if (!token) {
    navigate("/signin");
    return;
  }

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      reset(res.data.user);
    } catch (err) {
      navigate("/signin");
    }
  };

  fetchProfile();
}, [reset, navigate, token]);


  const onSubmit = async (data: ProfileForm) => {
    try {
      await axios.put("http://localhost:5000/api/auth/profile", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated!");
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your profile?")) return;
    try {
      await axios.delete("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      onLogout();
      navigate("/signin");
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
    navigate("/signin");
  };

  return (
    <div className="form-container">
      <h2>Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {["firstName", "lastName", "email", "password", "age", "city", "phone"].map((field) => (
          <div className="form-group" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              {...register(field as keyof ProfileForm, {required: true})}
              type={field === "password" ? "password" : "text"}
            />
          </div>
        ))}
        <button type="submit" className="btn">Update Profile</button>
      </form>
      <button className="btn delete-btn" onClick={handleDelete}>Delete Profile</button>
      <button className="btn logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
}
