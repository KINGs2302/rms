"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("loginuser");
      if (user) {
        router.push("/dashboard"); // Redirect if already logged in
      }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("https://restro-backend-0ozo.onrender.com/api/auth/local", { 
        identifier: email, 
        password: password 
      });

      localStorage.setItem("token", data.jwt);
      localStorage.setItem("loginuser", data.user.username);
      alert("Login successful: " + data.user.username);
      router.push("/dashboard"); // Redirect to Dashboard
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
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
            <CardFooter className="flex justify-center">
              <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800">Sign In</Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
