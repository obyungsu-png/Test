import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Brain, Zap, CheckCircle2, XCircle, Loader2, Settings, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7db3bef3`;

interface AISettings {
  provider: string;
  model: string;
}

export default function LMSAISettings() {
  const [settings, setSettings] = useState<AISettings>({ provider: "deepseek", model: "deepseek-chat" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Test states
  const [testingDeepseek, setTestingDeepseek] = useState(false);
  const [testingOpenRouter, setTestingOpenRouter] = useState(false);
  const [deepseekStatus, setDeepseekStatus] = useState<null | { valid: boolean; message: string }>(null);
  const [openRouterStatus, setOpenRouterStatus] = useState<null | { valid: boolean; message: string }>(null);

  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${publicAnonKey}` };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/ai/settings`, { headers });
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch (err) {
      console.error("Failed to load AI settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/ai/settings`, {
        method: "POST",
        headers,
        body: JSON.stringify({ settings }),
      });
      toast.success("AI 설정이 저장되었습니다!");
    } catch (err) {
      toast.error("저장 실패: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  const testDeepSeek = async () => {
    setTestingDeepseek(true);
    setDeepseekStatus(null);
    try {
      const res = await fetch(`${API_BASE}/ai/test-deepseek`, { headers });
      const data = await res.json();
      setDeepseekStatus({ valid: data.valid, message: data.message });
      if (data.valid) toast.success(data.message);
      else toast.error(data.message);
    } catch (err) {
      setDeepseekStatus({ valid: false, message: "연결 실패: " + String(err) });
      toast.error("DeepSeek 테스트 실패");
    } finally {
      setTestingDeepseek(false);
    }
  };

  const testOpenRouter = async () => {
    setTestingOpenRouter(true);
    setOpenRouterStatus(null);
    try {
      const res = await fetch(`${API_BASE}/ai/test-key`, { headers });
      const data = await res.json();
      setOpenRouterStatus({ valid: data.valid, message: data.message });
      if (data.valid) toast.success(data.message);
      else toast.error(data.message);
    } catch (err) {
      setOpenRouterStatus({ valid: false, message: "연결 실패: " + String(err) });
      toast.error("OpenRouter 테스트 실패");
    } finally {
      setTestingOpenRouter(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Brain className="w-6 h-6 text-cyan-600" />
          AI 설정
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          교과서 뽀개기에서 사용하는 AI 엔진을 설정합니다.
        </p>
      </div>

      {/* Provider Selection */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" /> AI 공급자 선택
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* DeepSeek */}
          <button
            onClick={() => setSettings({ ...settings, provider: "deepseek", model: "deepseek-chat" })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              settings.provider === "deepseek"
                ? "border-cyan-500 bg-cyan-50 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-gray-800">DeepSeek</span>
              {settings.provider === "deepseek" && (
                <CheckCircle2 className="w-5 h-5 text-cyan-600" />
              )}
            </div>
            <p className="text-xs text-gray-500">직접 연결 (추천)</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">빠른 속도</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">저렴한 가격</span>
            </div>
          </button>

          {/* OpenRouter */}
          <button
            onClick={() => setSettings({ ...settings, provider: "openrouter", model: "deepseek/deepseek-chat" })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              settings.provider === "openrouter"
                ? "border-cyan-500 bg-cyan-50 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-gray-800">OpenRouter</span>
              {settings.provider === "openrouter" && (
                <CheckCircle2 className="w-5 h-5 text-cyan-600" />
              )}
            </div>
            <p className="text-xs text-gray-500">중간 프록시 (백업)</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">다양한 모델</span>
              <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">폴백 지원</span>
            </div>
          </button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
          <strong>참고:</strong> DeepSeek 직접 연결 실패 시 자동으로 OpenRouter로 폴백됩니다.
          두 키 모두 설정해 두는 것을 권장합니다.
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            설정 저장
          </button>
        </div>
      </div>

      {/* API Key Test */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" /> API 키 연결 테스트
        </h3>

        <div className="space-y-4">
          {/* DeepSeek Test */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-bold text-gray-700">DeepSeek API</p>
              <p className="text-xs text-gray-400 mt-0.5">환경변수: DEEPSEEK_API_KEY</p>
              {deepseekStatus && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex items-center gap-1.5">
                  {deepseekStatus.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${deepseekStatus.valid ? "text-green-600" : "text-red-600"}`}>
                    {deepseekStatus.message}
                  </span>
                </motion.div>
              )}
            </div>
            <button
              onClick={testDeepSeek}
              disabled={testingDeepseek}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 flex items-center gap-1.5"
            >
              {testingDeepseek ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              테스트
            </button>
          </div>

          {/* Claude API Test */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-bold text-gray-700">Claude API</p>
              <p className="text-xs text-gray-400 mt-0.5">apiclaude.cc 프록시 (claude-sonnet-5)</p>
              {openRouterStatus && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex items-center gap-1.5">
                  {openRouterStatus.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${openRouterStatus.valid ? "text-green-600" : "text-red-600"}`}>
                    {openRouterStatus.message}
                  </span>
                </motion.div>
              )}
            </div>
            <button
              onClick={testOpenRouter}
              disabled={testingOpenRouter}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 flex items-center gap-1.5"
            >
              {testingOpenRouter ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              테스트
            </button>
          </div>
        </div>
      </div>

      {/* Usage Guide */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">AI 사용 범위</h3>
        <div className="space-y-2.5 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
            <span><strong>교과서 뽀개기:</strong> 텍스트 자동 분석으로 레슨 생성, AI 자동요약, 학생 요약 채점</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0" />
            <span><strong>모델:</strong> DeepSeek Chat (deepseek-chat) - 한국어/영어 교육 콘텐츠에 최적화</span>
          </div>
        </div>
      </div>
    </div>
  );
}
