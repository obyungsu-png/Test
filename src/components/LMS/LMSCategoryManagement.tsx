import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner@2.0.3";
import { 
  getSubjectStructure, 
  getCategoryCustomName, 
  setCategoryCustomName,
  getCategoryCustomNames 
} from "../utils/dataManager";

export default function LMSCategoryManagement() {
  const [schoolType, setSchoolType] = useState<'korean' | 'international' | 'certification'>('korean');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [customNames, setCustomNames] = useState(getCategoryCustomNames());

  const subjectStructure = getSubjectStructure(schoolType);

  const handleEdit = (schoolType: 'korean' | 'international' | 'certification', subject: string, level: string, category: string) => {
    const currentName = getCategoryCustomName(schoolType, subject, level, category);
    setEditValue(currentName);
    setEditingCategory(`${schoolType}-${subject}-${level}-${category}`);
  };

  const handleSave = (schoolType: 'korean' | 'international' | 'certification', subject: string, level: string, category: string) => {
    if (editValue.trim()) {
      setCategoryCustomName(schoolType, subject, level, category, editValue.trim());
      setCustomNames(getCategoryCustomNames());
      toast.success("카테고리 이름이 업데이트되었습니다.");
    }
    setEditingCategory(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setEditValue("");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl text-gray-800 mb-2">카테고리 관리</h1>
        <p className="text-gray-600">한국학교, 국제학교, 인증시험의 모든 카테고리 이름을 관리할 수 있습니다.</p>
      </div>

      <Tabs value={schoolType} onValueChange={(value) => setSchoolType(value as 'korean' | 'international' | 'certification')}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="korean">한국학교</TabsTrigger>
          <TabsTrigger value="international">국제학교</TabsTrigger>
          <TabsTrigger value="certification">인증시험</TabsTrigger>
        </TabsList>

        <TabsContent value="korean" className="space-y-6">
          {Object.entries(subjectStructure).map(([subject, levels]) => (
            <Card key={subject} className="p-6">
              <h2 className="text-2xl text-gray-800 mb-4 pb-2 border-b border-gray-200">{subject}</h2>
              
              <div className="space-y-4">
                {Object.entries(levels).map(([level, categories]) => (
                  <div key={level} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg text-gray-700 mb-3 flex items-center">
                      {level}
                      <Badge variant="secondary" className="ml-2">
                        {categories.length}개 항목
                      </Badge>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categories.map((category) => {
                        const editId = `${schoolType}-${subject}-${level}-${category}`;
                        const isEditing = editingCategory === editId;
                        const customName = getCategoryCustomName(schoolType, subject, level, category);
                        const hasCustomName = customName !== category;
                        
                        return (
                          <motion.div
                            key={category}
                            className="bg-white rounded-lg p-3 border border-gray-200 hover:border-cyan-300 transition-colors"
                            whileHover={{ scale: 1.02 }}
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  placeholder="카테고리 이름 입력"
                                  className="text-sm"
                                />
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSave(schoolType, subject, level, category)}
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
                                  >
                                    저장
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="text-xs"
                                  >
                                    취소
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-800">{customName}</p>
                                  {hasCustomName && (
                                    <p className="text-xs text-gray-500">원본: {category}</p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(schoolType, subject, level, category)}
                                  className="w-full text-xs"
                                >
                                  이름 편집
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="international" className="space-y-6">
          {Object.entries(subjectStructure).map(([subject, levels]) => (
            <Card key={subject} className="p-6">
              <h2 className="text-2xl text-gray-800 mb-4 pb-2 border-b border-gray-200">{subject}</h2>
              
              <div className="space-y-4">
                {Object.entries(levels).map(([level, categories]) => (
                  <div key={level} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg text-gray-700 mb-3 flex items-center">
                      {level}
                      <Badge variant="secondary" className="ml-2">
                        {categories.length}개 항목
                      </Badge>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categories.map((category) => {
                        const editId = `${schoolType}-${subject}-${level}-${category}`;
                        const isEditing = editingCategory === editId;
                        const customName = getCategoryCustomName(schoolType, subject, level, category);
                        const hasCustomName = customName !== category;
                        
                        return (
                          <motion.div
                            key={category}
                            className="bg-white rounded-lg p-3 border border-gray-200 hover:border-cyan-300 transition-colors"
                            whileHover={{ scale: 1.02 }}
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  placeholder="카테고리 이름 입력"
                                  className="text-sm"
                                />
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSave(schoolType, subject, level, category)}
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
                                  >
                                    저장
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="text-xs"
                                  >
                                    취소
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-800">{customName}</p>
                                  {hasCustomName && (
                                    <p className="text-xs text-gray-500">원본: {category}</p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(schoolType, subject, level, category)}
                                  className="w-full text-xs"
                                >
                                  이름 편집
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="certification" className="space-y-6">
          {Object.entries(subjectStructure).map(([subject, levels]) => (
            <Card key={subject} className="p-6">
              <h2 className="text-2xl text-gray-800 mb-4 pb-2 border-b border-gray-200">{subject}</h2>
              
              <div className="space-y-4">
                {Object.entries(levels).map(([level, categories]) => (
                  <div key={level} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg text-gray-700 mb-3 flex items-center">
                      {level}
                      <Badge variant="secondary" className="ml-2">
                        {categories.length}개 항목
                      </Badge>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categories.map((category) => {
                        const editId = `${schoolType}-${subject}-${level}-${category}`;
                        const isEditing = editingCategory === editId;
                        const customName = getCategoryCustomName(schoolType, subject, level, category);
                        const hasCustomName = customName !== category;
                        
                        return (
                          <motion.div
                            key={category}
                            className="bg-white rounded-lg p-3 border border-gray-200 hover:border-cyan-300 transition-colors"
                            whileHover={{ scale: 1.02 }}
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  placeholder="카테고리 이름 입력"
                                  className="text-sm"
                                />
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSave(schoolType, subject, level, category)}
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
                                  >
                                    저장
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="text-xs"
                                  >
                                    취소
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-800">{customName}</p>
                                  {hasCustomName && (
                                    <p className="text-xs text-gray-500">원본: {category}</p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(schoolType, subject, level, category)}
                                  className="w-full text-xs"
                                >
                                  이름 편집
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
