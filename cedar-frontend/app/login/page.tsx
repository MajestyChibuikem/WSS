"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAuthUser,
  selectValidationErrors,
  updateUserField,
} from "../store/slices/authSlice";
import { useLoginMutation } from "../store/slices/apiSlice";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import clsx from "clsx";

function Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const validationErrors = useSelector(selectValidationErrors);
  const [login] = useLoginMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // useEffect(() => {
  //   dispatch({ type: "RESET_APP" });
  // }, []);

  const handleChange = (field: "username" | "password", value: string) => {
    dispatch(updateUserField({ field, value }));
  };

  const handleLogin = async () => {
    if (!user.username || !user.password) {
      toast.error("Please enter both username and password");
      return;
    }

    try {
      setIsLoading(true);
      toast("Logging you in...");
      const response = await login({
        username: user.username,
        password: user.password,
      }).unwrap();
      localStorage.setItem("wineryAuthToken", response.token);
      localStorage.setItem("wineryUserRole", response.roles[0]);
      localStorage.setItem("wineryUserId", response.user_id.toString());
      localStorage.setItem("isAuth", "true");
      setIsLoading(false);
      router.push("/inventory");
    } catch (error) {
      setIsLoading(false);
      toast.error("Login failed");
      console.error("Login failed:", error);
    }
  };

  // Trigger login on pressing Enter key
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="fixed top-0 right-0 h-[100vh] w-[100vw] flex overflow-y-auto justify-center bg-wBrand-background ">
      <div className="h-max w-[25rem] border border-wBrand-accent p-8 rounded-xl space-y-8 relative top-[15vh] shadow-2xl">
        <div className="space-y-2">
          <h1 className="text-xl">Welcome</h1>
          <p className="text-sm text-gray-300">Login to get started.</p>
        </div>
        <div className="space-y-10">
          <div className="border group border-gray-300/20 rounded-lg flex relative py-2 px-2 flex-col focus-within:border-wBrand-accent/60">
            <label className="text-xs left-3 text-white/70 bg-wBrand-background -top-2 px-3 absolute group-focus-within:text-wBrand-accent/60">
              Username
            </label>
            <input
              type="text"
              value={user.username}
              onChange={(e) => handleChange("username", e.target.value)}
              className="bg-transparent outline-none text-sm"
              placeholder="Enter username"
            />
            {validationErrors.username && (
              <p className="text-xs text-red-600">
                {validationErrors.username}
              </p>
            )}
          </div>
          <div className="border border-gray-300/20 rounded-lg flex relative py-2 px-2 flex-col group focus-within:border-wBrand-accent/60">
            <label className="text-xs left-3 text-white/70 bg-wBrand-background -top-2 px-3 absolute group-focus-within:text-wBrand-accent/60">
              Password
            </label>
            <div className="flex items-center">
              <input
                value={user.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onKeyDown={handleKeyDown} // Listen for Enter key
                type={showPassword ? "text" : "password"}
                className="bg-transparent outline-none text-sm flex-1 pr-10"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-white/50 hover:text-white focus:outline-none"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-xs text-red-600">
                {validationErrors.password}
              </p>
            )}
          </div>
          <button
            disabled={isLoading}
            onClick={handleLogin}
            className={clsx(
              "w-full py-2 rounded-lg cursor-pointer",
              isLoading ? "bg-gray-500" : "bg-wBrand-accent"
            )}
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;
