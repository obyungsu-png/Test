import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import { Settings, Edit2, Save, RotateCcw, Globe } from "lucide-react";

export default function LMSSettings() {
  const [tabNames, setTabNames] = useState(["전체보기", "단월별 학습", "3일의 기적", "모의고사", "콘텐츠소개"]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // Load custom tab names from localStorage
  useEffect(() => {
    const customTabs = JSON.parse(localStorage.getItem('customTabNames') || 'null');
    if (customTabs) {
      setTabNames(customTabs);
    }
  }, []);

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditValue(tabNames[index]);
  };

  const handleSave = () => {
    if (editingIndex === null) return;
    
    if (!editValue.trim()) {
      toast.error("탭 이름을 입력해주세요.");
      return;
    }

    const newTabNames = [...tabNames];
    newTabNames[editingIndex] = editValue.trim();
    
    setTabNames(newTabNames);
    localStorage.setItem('customTabNames', JSON.stringify(newTabNames));
    
    setEditingIndex(null);
    setEditValue("");
    
    toast.success("탭 이름이 성공적으로 변경되었습니다!");
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleReset = () => {
    if (confirm("모든 탭 이름을 기본값으로 되돌리시겠습니까?")) {
      const defaultTabs = ["전체보기", "단월별 학습", "3일의 기적", "모의고사", "콘텐츠소개"];
      setTabNames(defaultTabs);
      localStorage.removeItem('customTabNames');
      setEditingIndex(null);
      setEditValue("");
      toast.success("탭 이름이 기본값으로 초기화되었습니다!");
    }
  };

  const defaultTabNames = ["전체보기", "단월별 학습", "3일의 기적", "모의고사", "콘텐츠소개"];
  const isCustomized = JSON.stringify(tabNames) !== JSON.stringify(defaultTabNames);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-gray-900">시스템 설정</h1>
        <p className="text-gray-600">LMS 시스템 및 서준01 사이트 설정을 관리합니다</p>
      </div>

      {/* Tab Names Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              서준01 사이트 탭 이름 관리
            </span>
            {isCustomized && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                사용자 정의됨
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <Settings className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm text-blue-900 mb-1">탭 이름 변경 기능</h3>
                <p className="text-xs text-blue-700">
                  서준01 메인 사이트의 콘텐츠 탭 이름을 변경할 수 있습니다. 
                  변경사항은 실시간으로 서준01 사이트에 반영됩니다.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg text-gray-800">콘텐츠 탭 이름</h3>
            
            <div className="grid gap-3">
              {tabNames.map((tabName, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-xs">
                      탭 {index + 1}
                    </Badge>
                    {editingIndex === index ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-64 bg-white"
                        placeholder="탭 이름을 입력하세요"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSave();
                          if (e.key === 'Escape') handleCancel();
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-800">{tabName}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {editingIndex === index ? (
                      <>
                        <Button
                          onClick={handleSave}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          저장
                        </Button>
                        <Button
                          onClick={handleCancel}
                          size="sm"
                          variant="outline"
                        >
                          취소
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleEditStart(index)}
                        size="sm"
                        variant="outline"
                        className="hover:bg-blue-50"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        편집
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                탭 이름 변경시 서준01 사이트에 즉시 반영됩니다.
              </div>
              
              <Button
                onClick={handleReset}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={!isCustomized}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                기본값으로 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            기타 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="text-sm text-gray-800">시스템 언어</h3>
                <p className="text-xs text-gray-500">LMS 시스템 표시 언어</p>
              </div>
              <Badge variant="outline">한국어</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="text-sm text-gray-800">시간대</h3>
                <p className="text-xs text-gray-500">시스템 표준 시간대</p>
              </div>
              <Badge variant="outline">KST (GMT+9)</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="text-sm text-gray-800">자동 로그아웃</h3>
                <p className="text-xs text-gray-500">비활성 상태 시 자동 로그아웃 시간</p>
              </div>
              <Badge variant="outline">2시간</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}