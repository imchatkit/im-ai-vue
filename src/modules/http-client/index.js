import axios from 'axios';

// 基础配置
const BASE_URL = 'http://106.52.81.52:8080/imcore';
const APP_KEY = 'keyAbcd123';

// 创建axios实例
const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Key': APP_KEY
  }
});

// 请求拦截器
httpClient.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('im_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
httpClient.interceptors.response.use(
  response => {
    const res = response.data;
    
    // 如果返回的状态码不是0，认为请求有错误
    if (res.code !== 0) {
      return Promise.reject(new Error(res.msg || '未知错误'));
    }
    
    return res.data;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * API接口服务类
 */
export class ApiService {
  /**
   * 用户注册
   * @param {string} nickname - 用户昵称
   * @param {string} attributes - 用户属性（可选）
   * @returns {Promise<Object>} - 注册结果
   */
  static async register(nickname, attributes = '') {
    return httpClient.post('/openapi/v1/user/register', {
      nickname,
      attributes
    });
  }

  /**
   * 用户登录
   * @param {string} userId - 用户ID
   * @param {string} device - 设备类型，默认为im_app_web
   * @returns {Promise<Object>} - 登录结果，包含用户信息和token
   */
  static async login(userId, device = 'im_app_web') {
    const result = await httpClient.post('/openapi/v1/user/login', {
      userId,
      device
    });
    
    // 如果登录成功，保存token到localStorage
    if (result && result.token) {
      localStorage.setItem('im_token', result.token);
      
      // 保存用户信息
      if (result.imUserVo) {
        localStorage.setItem('im_user', JSON.stringify(result.imUserVo));
      }
    }
    
    return result;
  }

  /**
   * 退出登录
   */
  static logout() {
    localStorage.removeItem('im_token');
    localStorage.removeItem('im_user');
  }

  /**
   * 获取当前登录用户信息
   * @returns {Object|null} - 用户信息，未登录时返回null
   */
  static getCurrentUser() {
    const userJson = localStorage.getItem('im_user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (e) {
      return null;
    }
  }

  /**
   * 检查是否已登录
   * @returns {boolean} - 是否已登录
   */
  static isLoggedIn() {
    return !!localStorage.getItem('im_token');
  }
}

export default httpClient; 