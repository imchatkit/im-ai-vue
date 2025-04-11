#!/bin/bash

# 部署脚本 - 由GitHub Actions调用

set -e

echo "===== IM-AI-Vue 部署脚本 ====="

# 确保环境变量已设置
if [ -z "$DOCKER_REGISTRY" ] || [ -z "$DOCKER_NAMESPACE" ] || [ -z "$IMAGE_TAG" ]; then
  echo "错误: 环境变量未设置 (DOCKER_REGISTRY, DOCKER_NAMESPACE, IMAGE_TAG)"
  exit 1
fi

# 检查Docker Compose命令
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
  echo "使用Docker Compose v1: docker-compose"
elif docker compose version &> /dev/null; then
  DOCKER_COMPOSE="docker compose"
  echo "使用Docker Compose v2: docker compose"
else
  echo "错误: 找不到docker-compose或docker compose命令"
  echo "尝试安装Docker Compose..."
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  
  if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    echo "Docker Compose安装成功"
  else
    echo "Docker Compose安装失败，退出部署"
    exit 1
  fi
fi

# 检查网络是否存在，不存在则创建
if ! docker network inspect im-network &>/dev/null; then
  echo "创建Docker网络: im-network"
  docker network create im-network
fi

# 打印将要使用的镜像
echo "将部署镜像: $DOCKER_REGISTRY/$DOCKER_NAMESPACE/im-ai-vue:$IMAGE_TAG"

# 停止并移除旧容器（如果存在）
if docker ps -a | grep -q im-ai-vue; then
  echo "停止并移除现有容器..."
  docker stop im-ai-vue || true
  docker rm im-ai-vue || true
fi

# 使用Docker Compose启动服务
echo "使用Docker Compose启动服务..."
$DOCKER_COMPOSE -f docker-compose.yml -f docker-compose.override.yml up -d

# 验证部署结果
if docker ps | grep -q im-ai-vue; then
  echo "✅ 部署成功! 容器正在运行中."
else
  echo "❌ 部署失败! 容器未能启动. 查看日志:"
  $DOCKER_COMPOSE logs im-ai-vue
  exit 1
fi

echo "===== 部署完成 =====" 