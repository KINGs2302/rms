"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("token");
      if (user) {
        router.push("/dashboard"); // Redirect if already logged in
      }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "https://restro-backend-0ozo.onrender.com/api/auth/local",
        {
          identifier: email,
          password: password,
        }
      );

      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        localStorage.setItem("loginuser", data.user.username);
        
        toast.success(`Welcome, ${data.user.username}!`, {
          position: "top-right",
          autoClose: 3000,
        });

        setTimeout(() => {
          router.push("/dashboard"); // Redirect only if valid login
        }, 1500);
      } else {
        toast.error("Invalid login credentials", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid credentials",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ToastContainer />
      <aside className="w-64 bg-gray-900 text-white flex items-center justify-center">
        <h2 className="text-xl font-semibold">Welcome</h2>
      </aside>
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center flex-col">
              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                Sign In
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
