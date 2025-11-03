import { Outlet, Link, useLocation } from 'react-router-dom';

/**
 * 布局组件
 * 提供导航栏和页面容器
 */
export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen">
      {/* 导航栏 */}
      <nav className="bg-white border-b-4 border-sketch-border shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <h1 className="sketch-title">🔐 密码生成器</h1>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/generator"
                className={
                  isActive('/generator')
                    ? 'sketch-nav-btn-active'
                    : 'sketch-nav-btn hover:text-sketch-primary'
                }
              >
                ✨ 生成密码
              </Link>
              <Link
                to="/list"
                className={
                  isActive('/list')
                    ? 'sketch-nav-btn-active'
                    : 'sketch-nav-btn hover:text-sketch-primary'
                }
              >
                📋 密码列表
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Outlet />
      </main>
    </div>
  );
}
