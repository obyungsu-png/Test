import { useState } from "react";
import { motion } from "motion/react";
import { X, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 로그인 로직은 여기에 구현
    console.log("Login attempt:", { email, password, rememberMe });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 text-white relative">
          <h2 className="text-xl font-semibold">로그인</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-600">로그인 상태 유지</span>
              </label>
              <button
                type="button"
                className="text-sm text-cyan-600 hover:text-cyan-800 transition-colors"
              >
                비밀번호 찾기
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              로그인
            </Button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" className="w-full">
                <svg className="w-4 h-4 mr-2" fill="#09B83E" viewBox="0 0 24 24">
                  <path d="M8.691 2.188C7.687 2.188 6.73 2.606 6.06 3.371c-.699.805-1.155 1.927-1.155 3.058 0 1.131.456 2.253 1.155 3.058.67.766 1.627 1.183 2.631 1.183 1.004 0 1.961-.417 2.631-1.183.699-.805 1.155-1.927 1.155-3.058 0-1.131-.456-2.253-1.155-3.058-.67-.765-1.627-1.183-2.631-1.183zm0 1.5c.654 0 1.283.283 1.739.805.456.523.719 1.283.719 2.136 0 .853-.263 1.613-.719 2.136-.456.522-1.085.805-1.739.805-.654 0-1.283-.283-1.739-.805-.456-.523-.719-1.283-.719-2.136 0-.853.263-1.613.719-2.136.456-.522 1.085-.805 1.739-.805zM11.551 8.721c.325.215.588.468.8.75.211.282.362.593.451.93.088.337.137.694.137 1.068v.087c0 .374-.049.731-.137 1.068-.089.337-.24.648-.451.93-.212.282-.475.535-.8.75 1.146.156 2.138.536 2.938 1.137.8.601 1.413 1.413 1.813 2.416.4 1.003.6 2.172.6 3.498v1.031h-1.5v-1.031c0-1.086-.169-2.005-.5-2.748-.331-.743-.806-1.308-1.413-1.691-.607-.383-1.338-.574-2.188-.574s-1.581.191-2.188.574c-.607.383-1.082.948-1.413 1.691-.331.743-.5 1.662-.5 2.748v1.031h-1.5v-1.031c0-1.326.2-2.495.6-3.498.4-1.003 1.013-1.815 1.813-2.416.8-.601 1.792-.981 2.938-1.137zM15.191 9.996c1.044 0 1.992.417 2.668 1.137.699.75 1.155 1.827 1.155 3.058 0 1.231-.456 2.308-1.155 3.058-.676.72-1.624 1.137-2.668 1.137-.261 0-.517-.034-.762-.1v-1.563c.245.066.505.1.762.1.653 0 1.283-.283 1.739-.805.456-.522.719-1.283.719-2.136 0-.853-.263-1.613-.719-2.136-.456-.522-1.086-.805-1.739-.805-.257 0-.517.034-.762.1v-1.563c.245-.066.501-.1.762-.1z"/>
                </svg>
                WeChat
              </Button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-cyan-600 hover:text-cyan-800 font-medium transition-colors"
              >
                회원가입
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}