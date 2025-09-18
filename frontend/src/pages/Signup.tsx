import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type SignupForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: number;
  phone: string;
  city: string;
};

type SignupProps = {
  onLogin: () => void;
};

export default function Signup({ onLogin }: SignupProps) {
  const { register, handleSubmit, reset } = useForm<SignupForm>();
  const navigate = useNavigate();

  const onSubmit = async (data: SignupForm) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", data);
      localStorage.setItem("token", res.data.token);
      onLogin();
      reset();
      navigate("/profile");
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {["firstName", "lastName", "email", "password", "age", "city", "phone"].map((field) => (
          <div className="form-group" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              {...register(field as keyof SignupForm)}
              required
              type={field === "password" ? "password" : "text"}
            />
          </div>
        ))}
        <button type="submit" className="btn">Sign Up</button>
      </form>
    </div>
  );
}
