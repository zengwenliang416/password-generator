import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { generatePassword } from '../utils/passwordGenerator';
import { calculatePasswordStrength, getStrengthLabel, getStrengthColor } from '../utils/passwordStrength';

export default function PasswordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const passwordId = parseInt(id!);

  const [tagInput, setTagInput] = useState('');
  const [rotateReason, setRotateReason] = useState('');
  const [copied, setCopied] = useState(false);
  const [showRotateForm, setShowRotateForm] = useState(false);
  const [password, setPassword] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载密码和历史
  useEffect(() => {
    loadPassword();
    loadHistory();
  }, [passwordId]);

  const loadPassword = async () => {
    try {
      const data = await api.passwords.getById(passwordId);
      setPassword(data);
    } catch (error) {
      console.error('加载密码失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await api.passwords.getHistory(passwordId);
      setHistory(data);
    } catch (error) {
      console.error('加载历史失败:', error);
    }
  };

  // 复制密码
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('复制失败');
    }
  };

  // 添加标签
  const handleAddTag = async () => {
    if (!password || !tagInput.trim()) return;

    const newTags = password.tags.includes(tagInput.trim())
      ? password.tags
      : [...password.tags, tagInput.trim()];

    try {
      await api.passwords.updateTags(passwordId, newTags);
      await loadPassword(); // 重新加载
      setTagInput('');
    } catch (error) {
      alert('添加标签失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 删除标签
  const handleRemoveTag = async (tag: string) => {
    if (!password) return;

    try {
      await api.passwords.updateTags(
        passwordId,
        password.tags.filter((t: string) => t !== tag)
      );
      await loadPassword(); // 重新加载
    } catch (error) {
      alert('删除标签失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 轮换密码
  const handleRotate = async () => {
    if (!password) return;

    try {
      const newPassword = generatePassword({
        length: password.length,
        includeNumbers: password.includeNumbers,
        includeSpecialChars: password.includeSpecialChars,
        includeUppercase: password.includeUppercase,
        includeLowercase: password.includeLowercase
      });

      await api.passwords.rotate(
        passwordId,
        newPassword,
        rotateReason || undefined
      );

      await loadPassword(); // 重新加载
      await loadHistory(); // 重新加载历史
      setShowRotateForm(false);
      setRotateReason('');
      alert('密码已轮换');
    } catch (error) {
      alert('轮换失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 删除密码
  const handleDelete = async () => {
    if (window.confirm('确定要删除这个密码吗？')) {
      try {
        await api.passwords.delete(passwordId);
        navigate('/list');
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
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="sketch-card text-center py-12">
          <p className="text-xl font-bold" style={{ color: 'var(--sketch-muted)' }}>⏳ 加载中...</p>
        </div>
      </div>
    );
  }

  if (!password) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="sketch-card text-center py-12 space-y-4">
          <p className="text-xl font-bold" style={{ color: 'var(--sketch-text)' }}>❌ 密码不存在</p>
          <Link
            to="/list"
            className="inline-block sketch-btn-primary"
          >
            ← 返回列表
          </Link>
        </div>
      </div>
    );
  }

  const strengthResult = calculatePasswordStrength(password.password);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 返回按钮 */}
      <Link
        to="/list"
        className="inline-flex items-center font-bold text-lg hover:scale-105 transition-transform"
        style={{ color: 'var(--sketch-primary)' }}
      >
        ← 返回列表
      </Link>

      {/* 密码信息卡片 */}
      <div className="sketch-card space-y-6">
        <div className="text-center">
          <h2 className="sketch-title inline-block">🔐 密码详情</h2>
        </div>

        {/* 密码显示 */}
        <div className="space-y-3">
          <label className="text-base font-bold" style={{ color: 'var(--sketch-text)' }}>🔑 密码</label>
          <div className="flex gap-3 flex-wrap">
            <code className="flex-1 px-4 py-3 bg-sketch-paper border-2 border-sketch-border rounded-lg font-mono text-lg font-bold break-all">
              {password.password}
            </code>
            <button
              onClick={() => handleCopy(password.password)}
              className={copied ? 'sketch-btn-secondary' : 'sketch-btn-accent'}
            >
              {copied ? '✓ 已复制' : '📋 复制'}
            </button>
          </div>
        </div>

        {/* 强度指示器 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold" style={{ color: 'var(--sketch-text)' }}>💪 密码强度</span>
            <span className={`font-bold text-lg ${getStrengthColor(strengthResult.strength)}`}>
              {getStrengthLabel(strengthResult.strength)} ({strengthResult.score}/100)
            </span>
          </div>
          <div className="sketch-progress">
            <div
              className="sketch-progress-bar"
              style={{ width: `${strengthResult.score}%` }}
            />
          </div>
        </div>

        {/* 配置信息 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-sketch-paper p-4 rounded-lg border-2 border-sketch-border">
            <span className="text-sm font-bold" style={{ color: 'var(--sketch-muted)' }}>📏 长度</span>
            <p className="text-lg font-bold mt-1" style={{ color: 'var(--sketch-text)' }}>{password.length} 个字符</p>
          </div>
          <div className="bg-sketch-paper p-4 rounded-lg border-2 border-sketch-border">
            <span className="text-sm font-bold" style={{ color: 'var(--sketch-muted)' }}>🎨 字符类型</span>
            <p className="text-base font-bold mt-1" style={{ color: 'var(--sketch-text)' }}>
              {[
                password.includeLowercase && '🔡 小写',
                password.includeUppercase && '🔠 大写',
                password.includeNumbers && '🔢 数字',
                password.includeSpecialChars && '✨ 特殊字符'
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="bg-sketch-paper p-4 rounded-lg border-2 border-sketch-border">
            <span className="text-sm font-bold" style={{ color: 'var(--sketch-muted)' }}>📅 创建时间</span>
            <p className="text-sm font-bold mt-1" style={{ color: 'var(--sketch-text)' }}>{formatDate(password.createdAt)}</p>
          </div>
          <div className="bg-sketch-paper p-4 rounded-lg border-2 border-sketch-border">
            <span className="text-sm font-bold" style={{ color: 'var(--sketch-muted)' }}>🔄 最后更新</span>
            <p className="text-sm font-bold mt-1" style={{ color: 'var(--sketch-text)' }}>{formatDate(password.updatedAt)}</p>
          </div>
        </div>

        {/* 标签管理 */}
        <div className="space-y-3">
          <label className="text-base font-bold" style={{ color: 'var(--sketch-text)' }}>🏷️ 标签</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="添加标签..."
              className="flex-1 sketch-input"
            />
            <button
              onClick={handleAddTag}
              className="sketch-btn-accent"
            >
              + 添加
            </button>
          </div>
          {password.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {password.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="sketch-tag"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:scale-125 transition-transform font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setShowRotateForm(!showRotateForm)}
            className="flex-1 sketch-btn-accent text-lg"
          >
            🔄 轮换密码
          </button>
          <button
            onClick={handleDelete}
            className="sketch-btn-primary text-lg"
          >
            🗑️ 删除
          </button>
        </div>

        {/* 轮换表单 */}
        {showRotateForm && (
          <div className="bg-sketch-paper border-2 border-sketch-border rounded-lg p-5 space-y-4">
            <h3 className="font-bold text-lg" style={{ color: 'var(--sketch-text)' }}>🔄 轮换密码</h3>
            <p className="text-sm font-medium" style={{ color: 'var(--sketch-muted)' }}>
              将使用相同的配置生成新密码，旧密码会保存到历史记录中
            </p>
            <input
              type="text"
              value={rotateReason}
              onChange={(e) => setRotateReason(e.target.value)}
              placeholder="轮换原因（可选）..."
              className="w-full sketch-input"
            />
            <div className="flex gap-3">
              <button
                onClick={handleRotate}
                className="flex-1 sketch-btn-accent"
              >
                ✓ 确认轮换
              </button>
              <button
                onClick={() => {
                  setShowRotateForm(false);
                  setRotateReason('');
                }}
                className="sketch-btn-primary"
              >
                ✕ 取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 轮换历史 */}
      {history && history.length > 0 && (
        <div className="sketch-card space-y-5">
          <div className="text-center">
            <h3 className="sketch-title text-3xl inline-block">📜 轮换历史</h3>
          </div>
          <div className="space-y-4">
            {history.map(record => (
              <div key={record.id} className="bg-sketch-paper border-2 border-sketch-border rounded-lg p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ color: 'var(--sketch-muted)' }}>
                      📅 {formatDate(record.rotatedAt)}
                    </div>
                    {record.reason && (
                      <div className="text-sm font-medium mt-2" style={{ color: 'var(--sketch-text)' }}>
                        💬 原因: {record.reason}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-bold" style={{ color: 'var(--sketch-muted)' }}>🔴 旧密码:</span>
                    <code className="block mt-2 px-3 py-2 bg-white border-2 border-sketch-border rounded font-mono text-sm font-bold break-all">
                      {record.oldPassword}
                    </code>
                  </div>
                  <div>
                    <span className="text-sm font-bold" style={{ color: 'var(--sketch-muted)' }}>🟢 新密码:</span>
                    <code className="block mt-2 px-3 py-2 bg-white border-2 border-sketch-border rounded font-mono text-sm font-bold break-all">
                      {record.newPassword}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
