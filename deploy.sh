#!/bin/bash

# 获取版本标签（默认为latest，可以通过参数指定）
TAG=${1:-latest}

echo "开始部署IM-AI前端项目，版本：$TAG"

# 确保环境变量已设置
if [ -z "$DOCKER_REGISTRY" ] || [ -z "$DOCKER_NAMESPACE" ]; then
  echo "错误：未设置DOCKER_REGISTRY或DOCKER_NAMESPACE环境变量"
  exit 1
fi

# 确保已登录到容器镜像服务
if [ -z "$REGISTRY_USERNAME" ] || [ -z "$REGISTRY_PASSWORD" ]; then
  echo "警告：未提供REGISTRY_USERNAME或REGISTRY_PASSWORD环境变量，可能需要手动登录容器服务"
else
  echo $REGISTRY_PASSWORD | docker login $DOCKER_REGISTRY -u $REGISTRY_USERNAME --password-stdin
fi

# 拉取最新镜像
IMAGE_NAME="$DOCKER_REGISTRY/$DOCKER_NAMESPACE/im-ai-vue:$TAG"
echo "拉取镜像：$IMAGE_NAME"
docker pull $IMAGE_NAME

# 创建或更新docker-compose配置
cat > docker-compose.override.yml << EOF
version: '3'
services:
  im-ai-vue:
    image: $IMAGE_NAME
    restart: always
    ports:
      - "80:80"
    environment:
      - TZ=Asia/Shanghai
EOF

# 启动服务
echo "启动服务..."
docker-compose up -d

echo "部署完成！" 