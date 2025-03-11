"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginFailure,
  loginSuccess,
  selectAuthUser,
  selectValidationErrors,
  updateUserField,
  validateUserInput,
} from "../store/slices/authSlice";
import { useLoginMutation } from "../store/slices/apiSlice";
import { useRouter } from "next/navigation";

function Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const validationErrors = useSelector(selectValidationErrors);
  const [login] = useLoginMutation();

  const handleChange = (field: "username" | "password", value: string) => {
    dispatch(updateUserField({ field, value }));
  };

  const handleLogin = async () => {
    try {
      const response = await login({
        username: user.username,
        password: user.password,
      }).unwrap(); // RTK Query call

      console.log("token: ", response.token);
      localStorage.setItem("authToken", response.token); // Use localStorage
      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="fixed top-0 right-0 h-[100vh] w-[100vw] flex overflow-y-auto justify-center bg-wBrand-background ">
      <div className="h-max w-[25rem] border border-wBrand-accent p-8 rounded-xl space-y-8 relative top-[15vh] shadow-2xl">
        <div className="space-y-2">
          <h1 className="text-xl">Welcome </h1>
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
            <input
              value={user.password}
              onChange={(e) => handleChange("password", e.target.value)}
              type="password"
              className="bg-transparent outline-none text-sm"
              placeholder="Enter password"
            />
            {validationErrors.password && (
              <p className="text-xs text-red-600">
                {validationErrors.password}
              </p>
            )}
          </div>
          <button
            onClick={handleLogin}
            className={"w-full py-2 rounded-lg cursor-pointer bg-wBrand-accent"}
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;
