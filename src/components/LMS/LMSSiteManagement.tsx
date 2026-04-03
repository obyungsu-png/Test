import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner@2.0.3";
import { Globe, Settings, Palette, Layout, ExternalLink, Save, RefreshCw, MessageCircle, Send, Upload, Trash2, QrCode } from "lucide-react";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoText: string;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  contactPhone: string;
  contactEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
}

export default function LMSSiteManagement() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "G 학습 가이드",
    siteDescription: "최고의 학습 대비 교육 플랫폼",
    logoText: "G 학습 가이드",
    primaryColor: "#3b82f6",
    secondaryColor: "#14b8a6",
    footerText: "© 2024 G 학습 가이드. All rights reserved.",
    contactPhone: "02-1234-5678",
    contactEmail: "info@gnaesin.com",
    maintenanceMode: false,
    allowRegistration: true
  });

  const [tabSettings, setTabSettings] = useState([
    "교과서 뽀개기", "단원별 학습", "모의고사", "직전 대비", "콘텐츠소개"
  ]);

  const [newTabName, setNewTabName] = useState("");
  const [stats, setStats] = useState({
    totalVisitors: 15234,
    dailyVisitors: 342,
    totalPageViews: 45123,
    bounceRate: 23.5
  });

  // QR 코드 관리
  const [qrImages, setQrImages] = useState<{ wechat: string; telegram: string }>({ wechat: '', telegram: '' });
  const wechatFileRef = useRef<HTMLInputElement>(null);
  const telegramFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load site settings from localStorage
    const savedSettings = localStorage.getItem('site_settings');
    if (savedSettings) {
      setSiteSettings(JSON.parse(savedSettings));
    }

    // Load tab names from localStorage (customTabNames for site display)
    const savedTabs = localStorage.getItem('customTabNames_korean');
    if (savedTabs) {
      setTabSettings(JSON.parse(savedTabs));
    }
    
    // Also ensure contentTypes stays synced for upload functionality
    const contentTypes = localStorage.getItem('contentTypes');
    if (!contentTypes) {
      localStorage.setItem('contentTypes', JSON.stringify(tabSettings));
    }

    // Load QR images
    const savedQR = localStorage.getItem('contact_qr_images');
    if (savedQR) {
      setQrImages(JSON.parse(savedQR));
    }
  }, []);

  const handleQRUpload = (type: 'wechat' | 'telegram', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error('이미지 크기는 500KB 이하로 업로드해주세요');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const updated = { ...qrImages, [type]: reader.result as string };
      setQrImages(updated);
      localStorage.setItem('contact_qr_images', JSON.stringify(updated));
      window.dispatchEvent(new Event('qrImagesUpdated'));
      toast.success(`${type === 'wechat' ? 'WeChat' : 'Telegram'} QR 코드가 등록되었습니다`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleQRDelete = (type: 'wechat' | 'telegram') => {
    const updated = { ...qrImages, [type]: '' };
    setQrImages(updated);
    localStorage.setItem('contact_qr_images', JSON.stringify(updated));
    window.dispatchEvent(new Event('qrImagesUpdated'));
    toast.success(`${type === 'wechat' ? 'WeChat' : 'Telegram'} QR 코드가 삭제되었습니다`);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('site_settings', JSON.stringify(siteSettings));
    toast.success('사이트 설정이 저장되었습니다.');
  };

  const handleAddTab = () => {
    if (newTabName.trim() && !tabSettings.includes(newTabName.trim())) {
      const updatedTabs = [...tabSettings, newTabName.trim()];
      setTabSettings(updatedTabs);
      localStorage.setItem('customTabNames_korean', JSON.stringify(updatedTabs));
      localStorage.setItem('contentTypes', JSON.stringify(updatedTabs));
      setNewTabName("");
      toast.success('새 탭이 추가되었습니다.');
    } else if (tabSettings.includes(newTabName.trim())) {
      toast.error('이미 존재하는 탭 이름입니다.');
    }
  };

  const handleRemoveTab = (tabName: string) => {
    if (tabSettings.length <= 1) {
      toast.error('최소 1개의 탭은 유지해야 합니다.');
      return;
    }

    const updatedTabs = tabSettings.filter(tab => tab !== tabName);
    setTabSettings(updatedTabs);
    localStorage.setItem('customTabNames_korean', JSON.stringify(updatedTabs));
    localStorage.setItem('contentTypes', JSON.stringify(updatedTabs));
    toast.success('탭이 삭제되었습니다.');
  };

  const handleEditTab = (oldName: string, newName: string) => {
    if (newName.trim() && newName !== oldName) {
      const updatedTabs = tabSettings.map(tab => tab === oldName ? newName.trim() : tab);
      setTabSettings(updatedTabs);
      localStorage.setItem('customTabNames_korean', JSON.stringify(updatedTabs));
      localStorage.setItem('contentTypes', JSON.stringify(updatedTabs));
      toast.success('탭 이름이 변경되었습니다.');
    }
  };

  const handleResetSettings = () => {
    if (confirm('모든 설정을 초기값으로 되돌리시겠습니까? (탭 이름도 함께 초기화됩니다)')) {
      const defaultSettings: SiteSettings = {
        siteName: "G 학습 가이드",
        siteDescription: "최고의 학습 대비 교육 플랫폼",
        logoText: "G 학습 가이드",
        primaryColor: "#3b82f6",
        secondaryColor: "#14b8a6",
        footerText: "© 2024 G 학습 가이드. All rights reserved.",
        contactPhone: "02-1234-5678",
        contactEmail: "info@gnaesin.com",
        maintenanceMode: false,
        allowRegistration: true
      };
      
      const defaultTabs = ["교과서 뽀개기", "단원별 학습", "모의고사", "직전 대비", "콘텐츠소개"];
      
      setSiteSettings(defaultSettings);
      setTabSettings(defaultTabs);
      
      localStorage.setItem('site_settings', JSON.stringify(defaultSettings));
      localStorage.removeItem('customTabNames_korean');
      localStorage.setItem('contentTypes', JSON.stringify(defaultTabs));
      
      toast.success('모든 설정이 초기값으로 되돌려졌습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl text-gray-900">사이트 관리</h1>
          <p className="text-gray-600">G 학습 가이드 사이트의 설정과 콘텐츠를 관리합니다</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => window.open('/', '_blank')}
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            사이트 보기
          </Button>
          <Button
            onClick={handleResetSettings}
            variant="outline"
            className="text-gray-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            초기화
          </Button>
        </div>
      </div>

      {/* Site Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-blue-600">{stats.totalVisitors.toLocaleString()}</div>
            <p className="text-sm text-gray-600">총 방자</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-green-600">{stats.dailyVisitors}</div>
            <p className="text-sm text-gray-600">일일 방문자</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-purple-600">{stats.totalPageViews.toLocaleString()}</div>
            <p className="text-sm text-gray-600">총 페이지뷰</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-orange-600">{stats.bounceRate}%</div>
            <p className="text-sm text-gray-600">이탈률</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              기본 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">사이트 이름</label>
              <Input
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                placeholder="사이트 이름"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">사이트 설명</label>
              <Input
                value={siteSettings.siteDescription}
                onChange={(e) => setSiteSettings({...siteSettings, siteDescription: e.target.value})}
                placeholder="사이트 설명"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">로고 텍스트</label>
              <Input
                value={siteSettings.logoText}
                onChange={(e) => setSiteSettings({...siteSettings, logoText: e.target.value})}
                placeholder="로고에 표시될 텍스트"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">연락처 전화번호</label>
              <Input
                value={siteSettings.contactPhone}
                onChange={(e) => setSiteSettings({...siteSettings, contactPhone: e.target.value})}
                placeholder="02-1234-5678"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">연락처 이메일</label>
              <Input
                type="email"
                value={siteSettings.contactEmail}
                onChange={(e) => setSiteSettings({...siteSettings, contactEmail: e.target.value})}
                placeholder="contact@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Design Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              디자인 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">메인 컬러</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={siteSettings.primaryColor}
                  onChange={(e) => setSiteSettings({...siteSettings, primaryColor: e.target.value})}
                  className="w-12 h-10 rounded border border-gray-300"
                />
                <Input
                  value={siteSettings.primaryColor}
                  onChange={(e) => setSiteSettings({...siteSettings, primaryColor: e.target.value})}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">보조 컬러</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={siteSettings.secondaryColor}
                  onChange={(e) => setSiteSettings({...siteSettings, secondaryColor: e.target.value})}
                  className="w-12 h-10 rounded border border-gray-300"
                />
                <Input
                  value={siteSettings.secondaryColor}
                  onChange={(e) => setSiteSettings({...siteSettings, secondaryColor: e.target.value})}
                  placeholder="#14b8a6"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">푸터 텍스트</label>
              <textarea
                value={siteSettings.footerText}
                onChange={(e) => setSiteSettings({...siteSettings, footerText: e.target.value})}
                placeholder="푸터에 표시될 텍스트"
                className="w-full p-3 border border-gray-300 rounded-md resize-none h-20 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={siteSettings.maintenanceMode}
                  onChange={(e) => setSiteSettings({...siteSettings, maintenanceMode: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">점검 모드</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={siteSettings.allowRegistration}
                  onChange={(e) => setSiteSettings({...siteSettings, allowRegistration: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">회원가입 허용</span>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Layout className="w-5 h-5 mr-2" />
              서준01 콘텐츠 탭 관리
            </span>
            <span className="text-sm text-gray-500">실시간 동기화</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm text-blue-900 mb-1">서준01 사이트 연동</h3>
                  <p className="text-xs text-blue-700">
                    여기서 변경한 탭 이름들이 서준01 메인 사이트의 콘텐츠 탭에 실시간으로 반영됩니다.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Input
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                placeholder="새 탭 이름 입력"
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddTab();
                }}
              />
              <Button
                onClick={handleAddTab}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                추가
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tabSettings.map((tab, index) => (
                <div key={tab} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                  <input
                    type="text"
                    value={tab}
                    onChange={(e) => {
                      const newTabs = [...tabSettings];
                      newTabs[index] = e.target.value;
                      setTabSettings(newTabs);
                    }}
                    onBlur={(e) => handleEditTab(tab, e.target.value)}
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                  />
                  <Button
                    onClick={() => handleRemoveTab(tab)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    삭제
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-2">
                <strong>사용법:</strong>
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 탭 이름을 직접 클릭하여 수정할 수 있습니다</li>
                <li>• 변경사항은 서준01 사이트에 즉시 반영됩니다</li>
                <li>• 최소 1개의 탭은 유지되어야 합니다</li>
                <li>• 업로드된 자료의 콘텐츠 타입도 함께 업데이트됩니다</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR 코드 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              QR 코드 관리
            </span>
            <span className="text-sm text-gray-500">실시간 동기화</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm text-blue-900 mb-1">서준01 사이트 연동</h3>
                  <p className="text-xs text-blue-700">
                    여기서 변경한 QR 코드들이 서준01 메인 사이트에 실시간으로 반영됩니다.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* WeChat QR */}
              <div className="p-4 bg-gray-50 rounded-xl border space-y-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-800">WeChat (微信)</span>
                  {qrImages.wechat && <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">등록됨</span>}
                </div>
                <input type="file" ref={wechatFileRef} onChange={(e) => handleQRUpload('wechat', e)} accept="image/*" className="hidden" />
                {qrImages.wechat ? (
                  <div className="relative w-36 h-36 mx-auto bg-white rounded-lg border overflow-hidden">
                    <img src={qrImages.wechat} alt="WeChat QR" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-36 h-36 mx-auto bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-400">미등록</span>
                  </div>
                )}
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => wechatFileRef.current?.click()} size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    {qrImages.wechat ? '변경' : '업로드'}
                  </Button>
                  {qrImages.wechat && (
                    <Button onClick={() => handleQRDelete('wechat')} size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      삭제
                    </Button>
                  )}
                </div>
              </div>

              {/* Telegram QR */}
              <div className="p-4 bg-gray-50 rounded-xl border space-y-3">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-800">Telegram</span>
                  {qrImages.telegram && <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">등록됨</span>}
                </div>
                <input type="file" ref={telegramFileRef} onChange={(e) => handleQRUpload('telegram', e)} accept="image/*" className="hidden" />
                {qrImages.telegram ? (
                  <div className="relative w-36 h-36 mx-auto bg-white rounded-lg border overflow-hidden">
                    <img src={qrImages.telegram} alt="Telegram QR" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-36 h-36 mx-auto bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-400">미등록</span>
                  </div>
                )}
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => telegramFileRef.current?.click()} size="sm" variant="outline" className="text-blue-500 border-blue-300 hover:bg-blue-50">
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    {qrImages.telegram ? '변경' : '업로드'}
                  </Button>
                  {qrImages.telegram && (
                    <Button onClick={() => handleQRDelete('telegram')} size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      삭제
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-2">
                <strong>사용법:</strong>
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• QR 코드를 업로드하여 서준01 사이트에 반영할 수 있습니다</li>
                <li>• 변경사항은 서준01 사이트에 즉시 반영됩니다</li>
                <li>• 이미지 크기는 500KB 이하로 업로드해주세요</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          설정 저장
        </Button>
      </div>
    </div>
  );
}