FROM nginx:alpine

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 清空默认静态文件
RUN rm -rf ./*

# 复制构建产物
COPY dist/ .

# 复制Nginx配置
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 对外暴露80端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"] 