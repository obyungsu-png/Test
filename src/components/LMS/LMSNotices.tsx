import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function LMSNotices() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-gray-900">공지사항</h1>
        <p className="text-gray-600">시스템 공지사항을 관리합니다</p>
      </div>
      
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">공지사항 기능이 준비 중입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}