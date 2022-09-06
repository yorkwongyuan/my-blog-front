# build stage
FROM node:12 as build-stage

# 表示谁来维护
LABEL maintainer=631824375@qq.com

# 创建一个工作目录
WORKDIR /app

# 拷贝内容
COPY . .

# 淘宝加速源
RUN npm install --registry=https://registry.npm.taobao.org

# 构建
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]