import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "../component/Button";
import { toast } from "react-toastify";

const loginSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await axios.post("/api/users/login", data);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/main");
      toast.success("로그인 성공!");
    } catch (error) {
      setError("root", {
        message: "아이디 또는 비밀번호가 잘못되었습니다.",
      });
    }
  };

  return (
    <div className="w-screen flex flex-col h-full mt-[55vh] px-4">
      <div className="w-7/12 mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input className="input" placeholder="ID" {...register("username")} />
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

          {errors.root?.message && (
            <p className="text-red-500 text-sm">{errors.root.message}</p>
          )}

          <Button
            type="submit"
            className="mt-5"
            disabled={isSubmitting}
            text={isSubmitting ? "로그인 중..." : "Login"}
          />
        </form>

        <p
          className="w-full text-right mt-2 text-sm text-blue-600 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          회원가입
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
