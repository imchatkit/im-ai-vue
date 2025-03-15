/**
 * Electron桥接模块
 * 用于检测是否在Electron环境中运行，并提供与Electron通信的接口
 */

// 检测是否在Electron环境中运行
export const isElectron = () => {
  console.log('检查是否在Electron环境中运行');
  
  // 检查全局变量
  if (typeof window !== 'undefined' && window.isElectron === true) {
    console.log('通过window.isElectron检测到Electron环境');
    return true;
  }
  
  // 检查electronDebug对象
  if (typeof window !== 'undefined' && window.electronDebug) {
    console.log('通过window.electronDebug检测到Electron环境');
    return true;
  }
  
  // 检查electron对象
  if (typeof window !== 'undefined' && window.electron) {
    console.log('通过window.electron检测到Electron环境');
    return true;
  }
  
  // 检查navigator.userAgent
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
    console.log('通过navigator.userAgent检测到Electron环境');
    return true;
  }
  
  // 检查process对象
  if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
    console.log('通过process.versions.electron检测到Electron环境');
    return true;
  }
  
  console.log('未检测到Electron环境');
  return false;
};

// 获取Electron API
export const getElectronAPI = () => {
  if (isElectron() && window.electron) {
    return window.electron;
  }
  return null;
};

// 发送消息到主进程
export const sendToMain = (channel, data) => {
  const api = getElectronAPI();
  if (api && api.send) {
    api.send(channel, data);
  } else {
    console.warn('Electron API not available');
  }
};

// 从主进程接收消息
export const receiveFromMain = (channel, callback) => {
  const api = getElectronAPI();
  if (api && api.receive) {
    api.receive(channel, callback);
  } else {
    console.warn('Electron API not available');
  }
};

// 获取平台信息
export const getPlatform = () => {
  const api = getElectronAPI();
  if (api && api.platform) {
    return api.platform;
  }
  return null;
};

export default {
  isElectron,
  getElectronAPI,
  sendToMain,
  receiveFromMain,
  getPlatform
}; 