"use client";

import { useState } from "react";
import {
  signUpUser,
  signInWithGoogle,
  verifyEmailCode,
} from "@/helpers/signUpHelp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
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

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const res = await signUpUser(email, password, displayName);
      if (!res.success) {
        toast.error(res.message, toastOptions);
      } else {
        toast.success(res.message, toastOptions);
        setShowVerification(true);
      }
    } catch (error) {
      toast.error("Sign-up failed: " + error.message, toastOptions);
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return;

    setLoading(true);
    try {
      const res = await verifyEmailCode(
        email,
        verificationCode,
        password,
        displayName
      );
      if (res.success) {
        toast.success(
          "Account created successfully! Redirecting...",
          toastOptions
        );
        setVerificationCode("");
        router.push("/dashboard");
      } else {
        toast.error(res.message, toastOptions);
        setVerificationCode("");
      }
    } catch (error) {
      toast.error("Verification failed: " + error.message, toastOptions);
      setVerificationCode("");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        router.push("/dashboard");
      } else {
        toast.error(res.error, toastOptions);
      }
    } catch (error) {
      toast.error("Google sign-in failed: " + error.message, toastOptions);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 relative">
      {" "}
      {/* Changed background to light gray */}
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
      <Card className="w-full max-w-md bg-white border-gray-300 shadow-lg">
        {" "}
        {/* Changed card background, border, and added shadow */}
        <CardHeader>
          <CardTitle className="text-center text-2xl text-gray-800">
            Create Account
          </CardTitle>{" "}
          {/* Changed text color to dark gray */}
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-white text-gray-800 border-gray-300"
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white text-gray-800 border-gray-300"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white text-gray-800 border-gray-300"
          />
          <Button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Processing..." : "Sign Up"}
          </Button>
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Processing..." : "Continue with Google"}
          </Button>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </CardContent>
      </Card>
      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent className="bg-white border-gray-300 text-gray-800">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter the 6-digit code sent to {email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label className="block text-sm font-medium text-gray-700">
              Verification Code
            </Label>
            <Input
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="bg-white text-gray-800 border-gray-300"
              maxLength={6}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleVerifyCode}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
