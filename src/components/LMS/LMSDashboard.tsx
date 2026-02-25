import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, BookOpen, Download, TrendingUp, Calendar, Bell } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const monthlyData = [
  { month: "1월", users: 65, downloads: 120, content: 15 },
  { month: "2월", users: 78, downloads: 145, content: 22 },
  { month: "3월", users: 92, downloads: 167, content: 28 },
  { month: "4월", users: 85, downloads: 189, content: 31 },
  { month: "5월", users: 110, downloads: 205, content: 35 },
  { month: "6월", users: 125, downloads: 234, content: 42 },
];

export default function LMSDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalContent: 0,
    totalDownloads: 0
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: "user", message: "김철수님이 새로 가입했습니다.", time: "5분 전" },
    { id: 2, type: "download", message: "[국어] 문학 작품 감상법 자료가 다운로드되었습니다.", time: "12분 전" },
    { id: 3, type: "upload", message: "새로운 영어 문법 자료가 업로드되었습니다.", time: "1시간 전" },
    { id: 4, type: "user", message: "이영희님의 구독이 갱신되었습니다.", time: "2시간 전" },
  ]);

  useEffect(() => {
    // Load stats from localStorage
    const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
    const users = JSON.parse(localStorage.getItem('lms_users') || '[]');
    
    setStats({
      totalUsers: users.length || 1234,
      activeUsers: users.filter((user: any) => user.status === 'active').length || 987,
      totalContent: uploads.length || 456,
      totalDownloads: uploads.reduce((acc: number, item: any) => acc + (item.downloadCount || 0), 0) || 789
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl text-gray-900">대시보드</h1>
          <p className="text-gray-600">서준 02 LMS 관리 현황을 확인하세요</p>
        </div>
        <div className="text-sm text-gray-500">
          마지막 업데이트: {new Date().toLocaleString('ko-KR')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">총 회원 수</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-green-600">
              +12% 지난 달 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">활성 회원</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-green-600">
              +8% 지난 달 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">총 콘텐츠</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalContent}</div>
            <p className="text-xs text-blue-600">
              +15 이번 주
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">총 다운로드</CardTitle>
            <Download className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-orange-600">
              +23% 지난 주 대비
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>월별 회원 증가 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>월별 다운로드 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="downloads" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'download' ? 'bg-green-500' : 'bg-purple-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              오늘의 일정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-3">
                <p className="text-sm text-gray-800">신규 콘텐츠 검토</p>
                <p className="text-xs text-gray-500">오전 10:00</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <p className="text-sm text-gray-800">회원 문의 답변</p>
                <p className="text-xs text-gray-500">오후 2:00</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-3">
                <p className="text-sm text-gray-800">시스템 점검</p>
                <p className="text-xs text-gray-500">오후 6:00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}