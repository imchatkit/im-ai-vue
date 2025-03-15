/**
 * Web适配器模块
 * 用于检测是否在Web环境中运行，并提供Web特有功能
 */

import { isElectron } from './electron-bridge';

// 检测是否在Web环境中运行
export const isWeb = () => {
  // 如果不是Electron环境，则认为是Web环境
  return !isElectron();
};

// 检测是否支持PWA
export const isPwaSupported = () => {
  return 'serviceWorker' in navigator;
};

// 检测是否可以安装PWA
export const isPwaInstallable = () => {
  return window.matchMedia('(display-mode: browser)').matches && 
         'BeforeInstallPromptEvent' in window;
};

// 检测是否支持通知
export const isNotificationSupported = () => {
  return 'Notification' in window;
};

// 请求通知权限
export const requestNotificationPermission = async () => {
  if (isNotificationSupported()) {
    return await Notification.requestPermission();
  }
  return 'denied';
};

// 发送通知
export const sendNotification = (title, options = {}) => {
  if (isNotificationSupported() && Notification.permission === 'granted') {
    return new Notification(title, options);
  }
  return null;
};

export default {
  isWeb,
  isPwaSupported,
  isPwaInstallable,
  isNotificationSupported,
  requestNotificationPermission,
  sendNotification
}; 