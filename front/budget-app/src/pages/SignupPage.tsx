import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "../component/Button";
import { toast } from "react-toastify";

const signupSchema = z
  .object({
    username: z.string().min(1, "아이디를 입력해주세요"),
    password: z.string().min(4, "비밀번호는 최소 4자 이상이어야 합니다"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

const SignupPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      await axios.post("/api/users", {
        username: data.username,
        password: data.password,
      });

      toast.success("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("username", {
        message: "이미 사용 중인 아이디입니다.",
      });
      toast.error("이미 사용 중인 아이디입니다.");
    }
  };

  return (
    <div className="w-screen flex flex-col h-full mt-[55vh] px-4">
      <div className="w-7/12 mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input
            className="input"
            placeholder="ID"
            disabled={isSubmitting}
            {...register("username")}
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}

          <input
            type="password"
            className="input"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          <input
            type="password"
            className="input"
            placeholder="Confirm Password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
          <Button
            className="mt-5"
            text={isSubmitting ? "가입 중..." : "Sign Up"}
            disabled={isSubmitting}
            type="submit"
          ></Button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
