import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function LMSReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-gray-900">리포트</h1>
        <p className="text-gray-600">학습 현황과 통계를 확인합니다</p>
      </div>
      
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">리포트 기능이 준비 중입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}