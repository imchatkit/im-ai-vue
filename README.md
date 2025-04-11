# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## 使用CNPM安装依赖

```bash
npm install -g cnpm
cnpm install
```

## 开发运行

```bash
npm run dev
```

## 打包构建

```bash
npm run build
```

## Electron 开发环境

首先下载electron主程序：

链接：https://npmmirror.com/mirrors/electron/v35.0.1/electron-v35.0.1-win32-x64.zip

保存位置：
echo %LOCALAPPDATA%\electron\Cache

%LOCALAPPDATA%\electron\Cache\electron-v35.0.1-win32-x64.zip

## CI/CD 流水线

本项目使用GitHub Actions自动构建和部署。当代码推送到main、master或dev分支时，会自动触发以下流程：

1. 构建Vue应用
2. 创建Docker镜像
3. 推送到容器镜像仓库
4. 部署到服务器

### 配置说明

CI/CD流水线需要以下GitHub Secrets配置：

- `TENCENT_REGISTRY_USERNAME`: 腾讯云容器镜像服务用户名
- `TENCENT_REGISTRY_PASSWORD`: 腾讯云容器镜像服务密码
- `SERVER_IP`: 部署服务器IP地址
- `SSH_USERNAME`: SSH用户名
- `SSH_PRIVATE_KEY`: SSH私钥

### 手动部署

如需手动部署，请执行：

```bash
# 克隆仓库
git clone https://github.com/yourusername/im-ai-vue.git
cd im-ai-vue

# 安装依赖
cnpm install

# 构建项目
npm run build

# 使用Docker构建镜像
docker build -t im-ai-vue .

# 运行容器
docker run -d -p 80:80 im-ai-vue
```