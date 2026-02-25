import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function LMSSchedule() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-gray-900">일정 관리</h1>
        <p className="text-gray-600">학습 일정과 스케줄을 관리합니다</p>
      </div>
      
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">일정 관리 기능이 준비 중입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}