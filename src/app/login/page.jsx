"use client";

import { useState } from "react";
import {
  loginWithEmailAndPassword,
  loginWithGoogle,
} from "@/helpers/loginHelp";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { auth, db } from "@/config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import "react-toastify/dist/ReactToastify.css";

const toastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light", // Changed to light theme for toast
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await loginWithEmailAndPassword(email, password);

      if (user) {
        toast.success("Login successful!", toastOptions);
        router.push("/dashboard");
      }
    } catch (error) {
      setError(error.message);
      toast.error("Login failed ", toastOptions);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();

      if (user) {
        toast.success("Logged in with Google!", toastOptions);
        router.push("/dashboard");
      }
    } catch (error) {
      setError(error.message);
      toast.error("Google login failed ", toastOptions);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return;
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);

      toast.success("Password reset link sent to your email!");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Error sending password reset email ", toastOptions);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 text-gray-800 relative">
      {" "}
      {/* Changed background and text color */}
      <ToastContainer theme="light" /> {/* Changed toast theme to light */}
      {/* DotBuilder Logo */}
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="text-gray-800 text-3xl font-bold tracking-tight"
        >
          {" "}
          {/* Changed text color to dark gray */}
          DotBuilder
        </Link>
      </div>
      <Card className="w-96 bg-white border border-gray-300 shadow-lg rounded-lg">
        {" "}
        {/* Changed card background, border, and added shadow */}
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold text-gray-800">
            Login
          </CardTitle>{" "}
          {/* Changed text color to dark gray */}
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}{" "}
          {/* Changed text color */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white text-gray-800 border border-gray-300"
              required
            />{" "}
            {/* Changed input background, text, and border */}
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white text-gray-800 border border-gray-300"
              required
            />{" "}
            {/* Changed input background, text, and border */}
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
            >
              Login with Email
            </Button>
          </form>
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
          >
            Login with Google
          </Button>
          <p className="text-center text-sm text-gray-600">
            {" "}
            {/* Changed text color */}
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign Up
            </Link>{" "}
            {/* Changed text color */}
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="link"
                className="w-full text-blue-600 hover:text-blue-700 text-sm"
              >
                {" "}
                {/* Changed text color */}
                Forgot Password?
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white p-6 rounded-lg text-gray-800">
              {" "}
              {/* Changed dialog background and text */}
              <DialogTitle className="text-lg font-semibold mb-4 text-gray-800">
                Reset Password
              </DialogTitle>{" "}
              {/* Changed text color */}
              <DialogDescription className="text-sm text-gray-600 mb-4">
                {" "}
                {/* Changed text color */}
                Enter your email to receive a password reset link.
              </DialogDescription>
              <Input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-4 bg-white text-gray-800 border border-gray-300 rounded-md text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-2 px-4 rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordReset}
                  disabled={isLoading}
                  className={`${
                    isLoading ? "bg-gray-400" : "bg-blue-600"
                  } hover:bg-blue-700 text-sm font-medium py-2 px-4 rounded-md text-white`}
                >
                  {isLoading ? "Sending..." : "Send Link"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
