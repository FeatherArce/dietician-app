"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { 
  FaUser, 
  FaKey,
  FaSpinner,
  FaSave,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCog,
  FaInfo,
  FaLock,
  FaPalette
} from "react-icons/fa";
import { UserRole } from "@/prisma-generated/postgres-client";
import { getUserRoleLabel } from "@/types/User";

type TabType = 'info' | 'profile' | 'password' | 'settings' | 'security';

// 可用主題列表
const availableThemes = [
  { value: "light", label: "淺色" },
  { value: "dark", label: "深色" },
  { value: "cupcake", label: "杯子蛋糕" },
  { value: "bumblebee", label: "大黃蜂" },
  { value: "emerald", label: "翡翠" },
  { value: "corporate", label: "企業" },
  { value: "synthwave", label: "合成波" },
  { value: "retro", label: "復古" },
  { value: "cyberpunk", label: "賽博朋克" },
  { value: "valentine", label: "情人節" },
  { value: "halloween", label: "萬聖節" },
  { value: "garden", label: "花園" },
  { value: "forest", label: "森林" },
  { value: "aqua", label: "水藍" },
  { value: "lofi", label: "低保真" },
  { value: "pastel", label: "粉彩" },
  { value: "fantasy", label: "幻想" },
  { value: "wireframe", label: "線框" },
  { value: "luxury", label: "奢華" },
  { value: "dracula", label: "德古拉" },
  { value: "cmyk", label: "CMYK" }
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [themeLoading, setThemeLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [currentTheme, setCurrentTheme] = useState('light');
  
  // 個人資料表單
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: ""
  });

  // 密碼修改表單
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<Record<string, string>>({});

  // 側邊欄選項
  const sidebarItems = [
    {
      id: 'info' as TabType,
      label: '帳戶資訊',
      icon: FaInfo,
      description: '查看帳戶基本信息'
    },
    {
      id: 'profile' as TabType,
      label: '編輯資料',
      icon: FaUser,
      description: '修改個人資料'
    },
    // {
    //   id: 'password' as TabType,
    //   label: '變更密碼',
    //   icon: FaKey,
    //   description: '更改登入密碼'
    // },
    {
      id: 'settings' as TabType,
      label: '偏好設定',
      icon: FaCog,
      description: '系統偏好設定'
    },
    // {
    //   id: 'security' as TabType,
    //   label: '安全設定',
    //   icon: FaLock,
    //   description: '帳戶安全選項'
    // }
  ];

  // 載入用戶資料
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || ""
      });
      // 設定使用者偏好主題
      const userTheme = user.preferred_theme || 'light';
      setCurrentTheme(userTheme);
      document.documentElement.setAttribute("data-theme", userTheme);
    }
  }, [user]);

  // 初始化主題
  useEffect(() => {
    const savedTheme = document.documentElement.getAttribute("data-theme") || 'light';
    setCurrentTheme(savedTheme);
  }, []);

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileForm.name.trim()) {
      newErrors.name = "名稱為必填";
    }

    if (!profileForm.email.trim()) {
      newErrors.email = "電子郵件為必填";
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      newErrors.email = "電子郵件格式不正確";
    }

    return newErrors;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "請輸入目前密碼";
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "請輸入新密碼";
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "新密碼至少需要 6 個字元";
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "請確認新密碼";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "密碼確認不一致";
    }

    return newErrors;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateProfileForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess({});

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess({ profile: '個人資料更新成功' });
        // 刷新用戶資料
        await refreshUser();
      } else {
        throw new Error(data.error || '更新失敗');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors({
        profile: error instanceof Error ? error.message : '更新個人資料失敗'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validatePasswordForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setPasswordLoading(true);
    setErrors({});
    setSuccess({});

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess({ password: '密碼修改成功' });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        throw new Error(data.error || '密碼修改失敗');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      setErrors({
        password: error instanceof Error ? error.message : '密碼修改失敗'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    
    // 清除對應的錯誤
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // 清除對應的錯誤
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleThemeChange = async (theme: string) => {
    setThemeLoading(true);
    setCurrentTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferred_theme: theme,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess({ theme: '主題設定已儲存' });
        // 刷新使用者資料
        await refreshUser();
      } else {
        throw new Error(data.error || '主題設定失敗');
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
      setErrors({
        theme: error instanceof Error ? error.message : '主題設定失敗'
      });
      // 回復到原來的主題
      const originalTheme = user?.preferred_theme || 'light';
      setCurrentTheme(originalTheme);
      document.documentElement.setAttribute("data-theme", originalTheme);
    } finally {
      setThemeLoading(false);
    }
  };

  // 渲染內容區域的函數
  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return renderAccountInfo();
      case 'profile':
        return renderProfileEdit();
      // case 'password':
      //   return renderPasswordChange();
      case 'settings':
        return renderSettings();
      case 'security':
        return renderSecurity();
      default:
        return renderAccountInfo();
    }
  };

  // 帳戶資訊組件
  const renderAccountInfo = () => (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-xl mb-4">帳戶資訊</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">用戶 ID</span>
            </label>
            <input
              type="text"
              value={user?.id || ''}
              className="input input-bordered w-full"
              disabled
            />
          </div>
          
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">角色</span>
            </label>
            <input
              type="text"
              value={getUserRoleLabel(user?.role || UserRole.USER)}
              className="input input-bordered w-full"
              disabled
            />
          </div>
          
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">帳戶狀態</span>
            </label>
            <div className="flex items-center space-x-2">
              <span className={`badge ${user?.is_active ? 'badge-success' : 'badge-error'}`}>
                {user?.is_active ? '啟用' : '停用'}
              </span>
            </div>
          </div>
          
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">註冊日期</span>
            </label>
            <input
              type="text"
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-TW') : ''}
              className="input input-bordered w-full"
              disabled
            />
          </div>
          
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">上次登入</span>
            </label>
            <input
              type="text"
              value={user?.last_login ? new Date(user.last_login).toLocaleString('zh-TW') : '從未登入'}
              className="input input-bordered w-full"
              disabled
            />
          </div>
          
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">登入次數</span>
            </label>
            <input
              type="text"
              value={user?.login_count || 0}
              className="input input-bordered w-full"
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );

  // 編輯個人資料組件
  const renderProfileEdit = () => (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-xl mb-4">編輯個人資料</h2>
        
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">姓名 *</span>
              </label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileInputChange}
                placeholder="請輸入您的姓名"
                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
              />
              {errors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.name}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">電子郵件 *</span>
              </label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileInputChange}
                placeholder="請輸入您的電子郵件"
                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email}</span>
                </label>
              )}
            </div>
          </div>

          {errors.profile && (
            <div className="alert alert-error">
              <span>{errors.profile}</span>
            </div>
          )}

          {success.profile && (
            <div className="alert alert-success">
              <span>{success.profile}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  更新中...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  儲存變更
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // 密碼修改組件
  const renderPasswordChange = () => (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-xl mb-4 flex items-center space-x-2">
          <FaKey className="w-5 h-5 text-secondary" />
          <span>修改密碼</span>
        </h2>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">目前密碼 *</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="請輸入目前密碼"
                  className={`input input-bordered w-full pr-12 ${errors.currentPassword ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.currentPassword}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">新密碼 *</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="請輸入新密碼"
                  className={`input input-bordered w-full pr-12 ${errors.newPassword ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.newPassword}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">確認新密碼 *</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="請再次輸入新密碼"
                  className={`input input-bordered w-full pr-12 ${errors.confirmPassword ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.confirmPassword}</span>
                </label>
              )}
            </div>
          </div>

          {errors.password && (
            <div className="alert alert-error">
              <span>{errors.password}</span>
            </div>
          )}

          {success.password && (
            <div className="alert alert-success">
              <span>{success.password}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn btn-secondary"
            >
              {passwordLoading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  修改中...
                </>
              ) : (
                <>
                  <FaKey className="w-4 h-4" />
                  修改密碼
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // 偏好設定組件
  const renderSettings = () => (
    <div className="space-y-6">
      {/* 主題設定 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4 flex items-center space-x-2">
            <FaPalette className="w-5 h-5 text-primary" />
            <span>主題設定</span>
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">選擇主題</span>
                <span className="label-text-alt">選擇您偏好的網站主題</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={currentTheme}
                onChange={(e) => handleThemeChange(e.target.value)}
                disabled={themeLoading}
              >
                {availableThemes.map((theme) => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
              {themeLoading && (
                <label className="label">
                  <span className="label-text-alt">
                    <FaSpinner className="w-3 h-3 animate-spin inline mr-1" />
                    正在儲存主題設定...
                  </span>
                </label>
              )}
              
              {errors.theme && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.theme}</span>
                </label>
              )}

              {success.theme && (
                <label className="label">
                  <span className="label-text-alt text-success">{success.theme}</span>
                </label>
              )}
            </div>

            {/* 主題預覽 */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">主題預覽</span>
              </label>
              <div className="p-4 border border-base-300 rounded-lg bg-base-200">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  <div className="w-4 h-4 bg-secondary rounded-full"></div>
                  <div className="w-4 h-4 bg-accent rounded-full"></div>
                  <div className="w-4 h-4 bg-neutral rounded-full"></div>
                </div>
                <div className="mt-2 text-sm text-base-content/70">
                  目前主題：{availableThemes.find(t => t.value === currentTheme)?.label}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 其他設定預留區域 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4 flex items-center space-x-2">
            <FaCog className="w-5 h-5 text-secondary" />
            <span>其他設定</span>
          </h2>
          <div className="text-center py-8">
            <FaCog className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">更多設定功能開發中</h3>
            <p className="text-base-content/70">
              包含通知設定、語言選擇等功能將在後續版本中推出！
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // 安全設定組件（佔位符）
  const renderSecurity = () => (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-xl mb-4 flex items-center space-x-2">
          <FaLock className="w-5 h-5 text-warning" />
          <span>安全設定</span>
        </h2>
        <div className="text-center py-8">
          <FaLock className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">安全功能開發中</h3>
          <p className="text-base-content/70">
            包含兩步驟驗證、登入記錄等安全功能將在後續版本中推出！
          </p>
        </div>
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">請先登入</h2>
          <p className="mb-4">您需要登入才能查看個人資料</p>
          <Link href="/auth/login" className="btn btn-primary">
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 頁面標題 */}
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => router.back()} 
          className="btn btn-ghost btn-circle"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <FaUser className="w-8 h-8 text-primary" />
            <span>個人資料</span>
          </h1>
          <p className="text-base-content/70 mt-1">
            管理您的帳戶資訊和設定
          </p>
        </div>
      </div>

      {/* 主要布局 - 側邊欄 + 內容區 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左側邊欄 */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="space-y-2">
                {sidebarItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                        activeTab === item.id
                          ? 'bg-primary text-primary-content'
                          : 'hover:bg-base-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className={`text-xs ${
                            activeTab === item.id 
                              ? 'text-primary-content/70' 
                              : 'text-base-content/70'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 右側內容區 */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}