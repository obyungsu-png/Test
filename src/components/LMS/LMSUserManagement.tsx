import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { Search, UserPlus, Edit2, Trash2, Mail, Calendar } from "lucide-react";
import type { User } from "../../LMSApp";

export default function LMSUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSubscription, setFilterSubscription] = useState("all");
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    qr: "",
    role: "student" as "admin" | "teacher" | "student",
    subscriptionPeriod: "1month" as "1month" | "3months" | "6months" | "1year"
  });

  useEffect(() => {
    // Load users from localStorage
    const savedUsers = localStorage.getItem('lms_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialize with sample data
      const sampleUsers: User[] = [
        {
          id: "1",
          name: "김철수",
          email: "kim@example.com",
          role: "student",
          subscriptionPeriod: "1year",
          subscriptionStart: "2024-01-01",
          subscriptionEnd: "2024-12-31",
          status: "active"
        },
        {
          id: "2",
          name: "이영희",
          email: "lee@example.com",
          role: "student",
          subscriptionPeriod: "6months",
          subscriptionStart: "2024-03-01",
          subscriptionEnd: "2024-08-31",
          status: "active"
        },
        {
          id: "3",
          name: "박민수",
          email: "park@example.com",
          role: "teacher",
          subscriptionPeriod: "1year",
          subscriptionStart: "2024-01-01",
          subscriptionEnd: "2024-12-31",
          status: "active"
        }
      ];
      setUsers(sampleUsers);
      localStorage.setItem('lms_users', JSON.stringify(sampleUsers));
    }
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    const matchesSubscription = filterSubscription === "all" || user.subscriptionPeriod === filterSubscription;
    
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error("이름과 이메일을 입력해주세요.");
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    
    switch (newUser.subscriptionPeriod) {
      case "1month":
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case "3months":
        endDate.setMonth(startDate.getMonth() + 3);
        break;
      case "6months":
        endDate.setMonth(startDate.getMonth() + 6);
        break;
      case "1year":
        endDate.setFullYear(startDate.getFullYear() + 1);
        break;
    }

    const user: User = {
      id: Date.now().toString(),
      ...newUser,
      subscriptionStart: startDate.toISOString().split('T')[0],
      subscriptionEnd: endDate.toISOString().split('T')[0],
      status: "active"
    };

    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    localStorage.setItem('lms_users', JSON.stringify(updatedUsers));
    
    setShowAddUser(false);
    setNewUser({ name: "", email: "", phone: "", qr: "", role: "student", subscriptionPeriod: "1month" });
    toast.success("새 회원이 추가되었습니다.");
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("정말로 이 회원을 삭제하시겠습니까?")) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('lms_users', JSON.stringify(updatedUsers));
      toast.success("회원이 삭제되었습니다.");
    }
  };

  const handleUpdateSubscription = (userId: string, period: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const startDate = new Date();
    const endDate = new Date();
    
    switch (period) {
      case "1month":
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case "3months":
        endDate.setMonth(startDate.getMonth() + 3);
        break;
      case "6months":
        endDate.setMonth(startDate.getMonth() + 6);
        break;
      case "1year":
        endDate.setFullYear(startDate.getFullYear() + 1);
        break;
    }

    const updatedUsers = users.map(u => 
      u.id === userId 
        ? {
            ...u,
            subscriptionPeriod: period as any,
            subscriptionStart: startDate.toISOString().split('T')[0],
            subscriptionEnd: endDate.toISOString().split('T')[0],
            status: "active" as const
          }
        : u
    );

    setUsers(updatedUsers);
    localStorage.setItem('lms_users', JSON.stringify(updatedUsers));
    toast.success("구독 기간이 갱신되었습니다.");
  };

  const getSubscriptionLabel = (period: string) => {
    switch (period) {
      case "1month": return "1개월";
      case "3months": return "3개월";
      case "6months": return "6개월";
      case "1year": return "1년";
      default: return period;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">활성</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">비활성</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">만료</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800">관리자</Badge>;
      case "teacher":
        return <Badge className="bg-blue-100 text-blue-800">교사</Badge>;
      case "student":
        return <Badge className="bg-orange-100 text-orange-800">학생</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl text-gray-900">회원 관리</h1>
          <p className="text-gray-600">등록된 회원들을 관리하고 구독 기간을 설정할 수 있습니다</p>
        </div>
        <Button
          onClick={() => setShowAddUser(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          새 회원 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-blue-600">{users.length}</div>
            <p className="text-sm text-gray-600">총 회원</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-green-600">{users.filter(u => u.status === 'active').length}</div>
            <p className="text-sm text-gray-600">활성 회원</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-orange-600">{users.filter(u => u.role === 'student').length}</div>
            <p className="text-sm text-gray-600">학생</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-purple-600">{users.filter(u => u.role === 'teacher').length}</div>
            <p className="text-sm text-gray-600">교사</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="이름 또는 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
                <SelectItem value="expired">만료</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSubscription} onValueChange={setFilterSubscription}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="구독 기간" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 기간</SelectItem>
                <SelectItem value="1month">1개월</SelectItem>
                <SelectItem value="3months">3개월</SelectItem>
                <SelectItem value="6months">6개월</SelectItem>
                <SelectItem value="1year">1년</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>회원 목록 ({filteredUsers.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">회원정보</th>
                  <th className="text-left p-4">역할</th>
                  <th className="text-left p-4">구독기간</th>
                  <th className="text-left p-4">상태</th>
                  <th className="text-left p-4">만료일</th>
                  <th className="text-left p-4">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="text-gray-800">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-4">
                      <Select
                        value={user.subscriptionPeriod}
                        onValueChange={(value) => handleUpdateSubscription(user.id, value)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1month">1개월</SelectItem>
                          <SelectItem value="3months">3개월</SelectItem>
                          <SelectItem value="6months">6개월</SelectItem>
                          <SelectItem value="1year">1년</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {user.subscriptionEnd}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg text-gray-800 mb-4">새 회원 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">이름</label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="회원 이름"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">이메일</label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="이메일 주소"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">전화번호</label>
                <Input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  placeholder="전화번호"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">QR</label>
                <Input
                  value={newUser.qr}
                  onChange={(e) => setNewUser({...newUser, qr: e.target.value})}
                  placeholder="QR 코드"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">역할</label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">학생</SelectItem>
                    <SelectItem value="teacher">교사</SelectItem>
                    <SelectItem value="admin">관리자</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">구독 기간</label>
                <Select value={newUser.subscriptionPeriod} onValueChange={(value: any) => setNewUser({...newUser, subscriptionPeriod: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">1개월</SelectItem>
                    <SelectItem value="3months">3개월</SelectItem>
                    <SelectItem value="6months">6개월</SelectItem>
                    <SelectItem value="1year">1년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handleAddUser}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                추가
              </Button>
              <Button
                onClick={() => setShowAddUser(false)}
                variant="outline"
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}