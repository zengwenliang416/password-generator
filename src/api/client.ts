/**
 * API 客户端
 * 封装所有后端 API 调用
 */

const API_BASE_URL = '/api';

/**
 * 发送 HTTP 请求
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  /**
   * 健康检查
   */
  health: () => request<{ status: string; timestamp: number }>('/health'),

  /**
   * 密码相关 API
   */
  passwords: {
    /**
     * 获取所有密码
     */
    getAll: () => request<any[]>('/passwords'),

    /**
     * 根据ID获取密码
     */
    getById: (id: number) => request<any>(`/passwords/${id}`),

    /**
     * 创建新密码
     */
    create: (data: { password: string; tags: string[]; config: any }) =>
      request<{ id: number }>('/passwords', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /**
     * 更新密码标签
     */
    updateTags: (id: number, tags: string[]) =>
      request<{ success: boolean }>(`/passwords/${id}/tags`, {
        method: 'PATCH',
        body: JSON.stringify({ tags }),
      }),

    /**
     * 轮换密码
     */
    rotate: (id: number, newPassword: string, reason?: string) =>
      request<{ success: boolean }>(`/passwords/${id}/rotate`, {
        method: 'POST',
        body: JSON.stringify({ newPassword, reason }),
      }),

    /**
     * 获取密码历史
     */
    getHistory: (id: number) => request<any[]>(`/passwords/${id}/history`),

    /**
     * 删除密码
     */
    delete: (id: number) =>
      request<{ success: boolean }>(`/passwords/${id}`, {
        method: 'DELETE',
      }),
  },

  /**
   * 生成记录相关 API
   */
  generations: {
    /**
     * 创建生成记录
     */
    create: (data: {
      password: string;
      config: any;
      isSaved?: boolean;
      passwordId?: number;
    }) =>
      request<{ id: number }>('/generations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /**
     * 获取所有生成记录
     */
    getAll: (limit?: number) =>
      request<any[]>(`/generations${limit ? `?limit=${limit}` : ''}`),

    /**
     * 更新保存状态
     */
    updateSaveStatus: (id: number, passwordId: number) =>
      request<{ success: boolean }>(`/generations/${id}/save`, {
        method: 'PATCH',
        body: JSON.stringify({ passwordId }),
      }),
  },
};
