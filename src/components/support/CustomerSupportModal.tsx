import { useState } from "react";
import { motion } from "motion/react";
import { X, MessageCircle, Phone, Mail, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLMSClick?: () => void;
}

export function CustomerSupportModal({ isOpen, onClose, onLMSClick }: CustomerSupportModalProps) {
  const [activeTab, setActiveTab] = useState<'contact' | 'faq' | 'inquiry' | 'lms'>('contact');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: ""
  });

  const contactInfo = [
    {
      icon: Phone,
      title: "전화 문의",
      value: "1588-1234",
      description: "월-금 9:00-18:00"
    },
    {
      icon: Mail,
      title: "이메일 문의",
      value: "support@nscoach.com",
      description: "24시간 접수 가능"
    },
    {
      icon: MessageCircle,
      title: "카카오톡 문의",
      value: "@NSCoach",
      description: "월-금 9:00-18:00"
    }
  ];

  const faqData = [
    {
      question: "회원가입은 어떻게 하나요?",
      answer: "홈페이지 우측 상단의 '회원가입' 버튼을 클릭하여 필요한 정보를 입력하시면 됩니다. 이메일 인증 후 바로 서비스를 이용하실 수 있습니다."
    },
    {
      question: "학습 자료를 다운로드할 수 없어요.",
      answer: "학습 자료 다운로드는 로그인 후 이용 가능합니다. 로그인 상태를 확인하시고, 문제가 지속되면 고객센터로 문의해 주세요."
    },
    {
      question: "비밀번호를 잊어버렸어요.",
      answer: "로그인 페이지에서 '비밀번호 찾기'를 클릭하여 등록된 이메일로 비밀번호 재설정 링크를 받으실 수 있습니다."
    },
    {
      question: "결제 관련 문의는 어떻게 하나요?",
      answer: "결제 관련 문의는 고객센터 전화(1588-1234) 또는 이메일(support@nscoach.com)로 문의해 주시면 신속하게 도움드리겠습니다."
    },
    {
      question: "환불 정책이 궁금해요.",
      answer: "서비스 이용 전 환불은 100% 가능하며, 이용 후에는 이용약관에 따라 차등 환불됩니다. 자세한 내용은 이용약관을 참고해 주세요."
    }
  ];

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("문의 내용:", inquiryForm);
    alert("문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.");
    setInquiryForm({ name: "", email: "", subject: "", message: "", category: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 text-white relative">
          <h2 className="text-xl font-semibold">고객센터</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'contact', label: '연락처' },
              { id: 'faq', label: '자주묻는질문' },
              { id: 'inquiry', label: '1:1문의' },
              { id: 'lms', label: 'LMS' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">문의 방법을 선택해주세요</h3>
                <p className="text-gray-600">빠르고 정확한 답변을 위해 적절한 문의 방법을 이용해주세요</p>
              </div>
              
              <div className="grid gap-4">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{info.title}</h4>
                          <p className="text-blue-600 font-medium">{info.value}</p>
                          <p className="text-sm text-gray-500">{info.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">고객센터 운영시간</h4>
                </div>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>• 평일: 09:00 - 18:00</p>
                  <p>• 점심시간: 12:00 - 13:00</p>
                  <p>• 주말 및 공휴일 휴무</p>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">자주 묻는 질문</h3>
                <p className="text-gray-600">많은 분들이 궁금해하시는 내용들을 모았습니다</p>
              </div>

              {faqData.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="border-t border-gray-200 px-4 py-3 bg-gray-50"
                    >
                      <p className="text-gray-700">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* LMS Tab */}
          {activeTab === 'lms' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">LMS 시스템</h3>
                <p className="text-gray-600">학습 관리 시스템에 접속하여 더 많은 기능을 이용해보세요</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">학습 관리 시스템</h4>
                  <p className="text-gray-600">
                    콘텐츠 업로드, 사용자 관리, 학습 분석 등<br/>
                    고급 관리 기능을 이용하실 수 있습니다.
                  </p>
                  <Button
                    onClick={() => {
                      if (onLMSClick) {
                        onLMSClick();
                        onClose();
                      }
                    }}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3"
                  >
                    LMS 시스템 접속
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">📚 콘텐츠 관리</h5>
                  <p className="text-gray-600">학습 자료 업로드 및 카테고리 관리</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">👥 사용자 관리</h5>
                  <p className="text-gray-600">학생 및 강사 계정 관리</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">📊 학습 분석</h5>
                  <p className="text-gray-600">학습 진도 및 성과 분석</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">⚙️ 시스템 설정</h5>
                  <p className="text-gray-600">사이트 설정 및 환경 구성</p>
                </div>
              </div>
            </div>
          )}

          {/* Inquiry Tab */}
          {activeTab === 'inquiry' && (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1:1 문의하기</h3>
                <p className="text-gray-600">궁금한 사항을 남겨주시면 빠르게 답변드리겠습니다</p>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-name">이름</Label>
                    <Input
                      id="inquiry-name"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="이름을 입력하세요"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-email">이메일</Label>
                    <Input
                      id="inquiry-email"
                      type="email"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="이메일을 입력하세요"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inquiry-category">문의 유형</Label>
                  <select
                    id="inquiry-category"
                    value={inquiryForm.category}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">문의 유형을 선택하세요</option>
                    <option value="account">계정 관련</option>
                    <option value="payment">결제 관련</option>
                    <option value="content">콘텐츠 관련</option>
                    <option value="technical">기술적 문제</option>
                    <option value="other">기타</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inquiry-subject">제목</Label>
                  <Input
                    id="inquiry-subject"
                    value={inquiryForm.subject}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="문의 제목을 입력하세요"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inquiry-message">문의 내용</Label>
                  <Textarea
                    id="inquiry-message"
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="문의 내용을 자세히 입력해주세요"
                    rows={5}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  문의하기
                </Button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}