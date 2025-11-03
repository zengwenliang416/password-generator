import { useState } from 'react';
import { generatePassword } from '../utils/passwordGenerator';
import { calculatePasswordStrength, getStrengthLabel, getStrengthColor } from '../utils/passwordStrength';
import { PasswordConfig } from '../db/types';
import { api } from '../api/client';

export default function PasswordGenerator() {
  const [config, setConfig] = useState<PasswordConfig>({
    length: 16,
    includeNumbers: true,
    includeSpecialChars: true,
    includeUppercase: true,
    includeLowercase: true
  });

  const [password, setPassword] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generationId, setGenerationId] = useState<number | null>(null);

  // 生成密码
  const handleGenerate = async () => {
    try {
      const newPassword = generatePassword(config);
      setPassword(newPassword);
      setCopied(false);
      setSaved(false);

      // 记录生成历史
      try {
        const result = await api.generations.create({
          password: newPassword,
          config,
          isSaved: false
        });
        setGenerationId(result.id);
      } catch (error) {
        console.error('记录生成历史失败:', error);
        // 不影响主流程，静默失败
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '生成密码失败');
    }
  };

  // 复制密码
  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('复制失败');
    }
  };

  // 添加标签
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // 保存密码
  const handleSave = async () => {
    if (!password) {
      alert('请先生成密码');
      return;
    }

    try {
      const result = await api.passwords.create({ password, tags, config });

      // 更新生成记录的保存状态
      if (generationId) {
        try {
          await api.generations.updateSaveStatus(generationId, result.id);
        } catch (error) {
          console.error('更新生成记录失败:', error);
          // 不影响主流程，静默失败
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      alert('密码已保存');
    } catch (error) {
      alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 计算强度
  const strengthResult = password ? calculatePasswordStrength(password) : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sketch-card space-y-6">
        {/* 标题 */}
        <div className="text-center">
          <h2 className="sketch-title inline-block">✨ 生成强密码</h2>
        </div>

        {/* 密码显示区 */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={password}
              readOnly
              placeholder="👇 点击下方按钮生成密码"
              className="flex-1 sketch-input font-mono text-lg"
            />
            <button
              onClick={handleCopy}
              disabled={!password}
              className={password ? (copied ? 'sketch-btn-secondary' : 'sketch-btn-accent') : 'sketch-btn opacity-50 cursor-not-allowed'}
            >
              {copied ? '✓ 已复制' : '📋 复制'}
            </button>
          </div>

          {/* 强度指示器 */}
          {strengthResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--sketch-muted)' }}>💪 密码强度:</span>
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
              <p className="text-xs font-medium text-center" style={{ color: 'var(--sketch-muted)' }}>
                🔐 熵值: {strengthResult.entropy} bits
              </p>
            </div>
          )}
        </div>

        {/* 配置选项 */}
        <div className="space-y-5">
          {/* 长度滑块 */}
          <div>
            <label className="block text-base font-bold mb-3" style={{ color: 'var(--sketch-text)' }}>
              📏 密码长度: <span className="text-sketch-primary">{config.length}</span> 个字符
            </label>
            <input
              type="range"
              min="8"
              max="128"
              value={config.length}
              onChange={(e) => setConfig({ ...config, length: parseInt(e.target.value) })}
              className="sketch-slider"
            />
          </div>

          {/* 字符类型选项 */}
          <div>
            <label className="block text-base font-bold mb-3" style={{ color: 'var(--sketch-text)' }}>
              🎨 字符类型:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeLowercase}
                  onChange={(e) => setConfig({ ...config, includeLowercase: e.target.checked })}
                  className="sketch-checkbox"
                />
                <span className="font-medium">小写字母 (a-z)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeUppercase}
                  onChange={(e) => setConfig({ ...config, includeUppercase: e.target.checked })}
                  className="sketch-checkbox"
                />
                <span className="font-medium">大写字母 (A-Z)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeNumbers}
                  onChange={(e) => setConfig({ ...config, includeNumbers: e.target.checked })}
                  className="sketch-checkbox"
                />
                <span className="font-medium">数字 (0-9)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeSpecialChars}
                  onChange={(e) => setConfig({ ...config, includeSpecialChars: e.target.checked })}
                  className="sketch-checkbox"
                />
                <span className="font-medium">特殊字符 (!@#$)</span>
              </label>
            </div>
          </div>
        </div>

        {/* 标签管理 */}
        <div className="space-y-3">
          <label className="block text-base font-bold" style={{ color: 'var(--sketch-text)' }}>
            🏷️ 标签 <span className="text-sm font-normal" style={{ color: 'var(--sketch-muted)' }}>(可选)</span>
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="输入标签后按回车..."
              className="flex-1 sketch-input"
            />
            <button
              onClick={handleAddTag}
              className="sketch-btn-accent"
            >
              + 添加
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
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
        <div className="flex gap-4 pt-2">
          <button
            onClick={handleGenerate}
            className="flex-1 sketch-btn-primary text-xl"
          >
            ✨ 生成密码
          </button>
          <button
            onClick={handleSave}
            disabled={!password}
            className={password ? (saved ? 'flex-1 sketch-btn-secondary text-xl' : 'flex-1 sketch-btn-accent text-xl') : 'flex-1 sketch-btn text-xl opacity-50 cursor-not-allowed'}
          >
            {saved ? '✓ 已保存' : '💾 保存密码'}
          </button>
        </div>
      </div>
    </div>
  );
}
