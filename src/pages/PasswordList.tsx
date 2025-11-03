import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function PasswordList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [passwords, setPasswords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载密码列表
  useEffect(() => {
    loadPasswords();
  }, []);

  const loadPasswords = async () => {
    try {
      const data = await api.passwords.getAll();
      setPasswords(data);
    } catch (error) {
      console.error('加载密码失败:', error);
      alert('加载密码失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取所有标签
  const allTags = Array.from(
    new Set(passwords?.flatMap(p => p.tags) || [])
  );

  // 筛选密码
  const filteredPasswords = passwords?.filter(pwd => {
    const matchesTag = !selectedTag || pwd.tags.includes(selectedTag);
    const matchesSearch = !searchQuery || pwd.tags.some((tag: string) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesTag && matchesSearch;
  }) || [];

  // 复制密码
  const handleCopy = async (password: string, id: number) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      alert('复制失败');
    }
  };

  // 删除密码
  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这个密码吗？')) {
      try {
        await api.passwords.delete(id);
        await loadPasswords(); // 重新加载列表
      } catch (error) {
        alert('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
      }
    }
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 标题和搜索栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="sketch-title">📋 密码列表</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 搜索标签..."
          className="w-full sm:w-64 sketch-input"
        />
      </div>

      {/* 标签过滤器 */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={!selectedTag ? 'sketch-tag bg-sketch-primary text-white' : 'sketch-tag'}
          >
            📌 全部 ({passwords?.length || 0})
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={selectedTag === tag ? 'sketch-tag bg-sketch-secondary text-white' : 'sketch-tag'}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* 加载状态 */}
      {loading ? (
        <div className="sketch-card text-center py-12">
          <p className="text-lg font-medium" style={{ color: 'var(--sketch-muted)' }}>⏳ 加载中...</p>
        </div>
      ) : filteredPasswords.length === 0 ? (
        <div className="sketch-card text-center py-12 space-y-4">
          <p className="text-xl font-bold" style={{ color: 'var(--sketch-text)' }}>
            {passwords?.length === 0
              ? '📭 还没有保存任何密码'
              : '🔍 没有找到匹配的密码'}
          </p>
          {passwords?.length === 0 && (
            <Link
              to="/generator"
              className="inline-block sketch-btn-primary"
            >
              ✨ 生成密码
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredPasswords.map(pwd => (
            <div
              key={pwd.id}
              className="sketch-card"
            >
              <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                <div className="flex-1 space-y-3 w-full">
                  {/* 密码 */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <code className="text-lg font-mono bg-sketch-paper px-4 py-2 rounded-lg border-2 border-sketch-border font-bold break-all">
                      {pwd.password}
                    </code>
                    <button
                      onClick={() => handleCopy(pwd.password, pwd.id!)}
                      className={copiedId === pwd.id ? 'sketch-btn-secondary text-sm' : 'sketch-btn-accent text-sm'}
                    >
                      {copiedId === pwd.id ? '✓ 已复制' : '📋 复制'}
                    </button>
                  </div>

                  {/* 标签 */}
                  {pwd.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {pwd.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="sketch-tag text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 配置信息 */}
                  <div className="flex flex-wrap gap-3 text-sm font-medium" style={{ color: 'var(--sketch-muted)' }}>
                    <span>📏 长度: {pwd.length}</span>
                    {pwd.includeNumbers && <span>🔢 数字</span>}
                    {pwd.includeSpecialChars && <span>✨ 特殊字符</span>}
                    {pwd.includeUppercase && <span>🔠 大写</span>}
                    {pwd.includeLowercase && <span>🔡 小写</span>}
                  </div>

                  {/* 时间信息 */}
                  <div className="text-xs font-medium" style={{ color: 'var(--sketch-muted)' }}>
                    📅 创建于: {formatDate(pwd.createdAt)}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 lg:flex-col w-full lg:w-auto">
                  <Link
                    to={`/password/${pwd.id}`}
                    className="flex-1 lg:flex-initial sketch-btn-secondary text-sm text-center"
                  >
                    📝 详情
                  </Link>
                  <button
                    onClick={() => handleDelete(pwd.id!)}
                    className="flex-1 lg:flex-initial sketch-btn-primary text-sm"
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 统计信息 */}
      <div className="sketch-card text-center py-4">
        <p className="font-bold text-base" style={{ color: 'var(--sketch-text)' }}>
          📊 共 {filteredPasswords.length} 个密码
          {selectedTag && (
            <span className="ml-2" style={{ color: 'var(--sketch-primary)' }}>
              · 筛选: {selectedTag}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
