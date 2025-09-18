import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type LoginForm = {
  email: string;
  password: string;
};

type LoginProps = {
  onLogin: () => void;
};

export default function Login({ onLogin }: LoginProps) {
  const { register, handleSubmit } = useForm<LoginForm>();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signin", data);
      localStorage.setItem("token", res.data.token);
      onLogin();
      navigate("/profile");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Email</label>
          <input {...register("email")} type="email" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input {...register("password")} type="password" required />
        </div>
        <button type="submit" className="btn">Login</button>
      </form>
      <button className="btn signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
    </div>
  );
}
