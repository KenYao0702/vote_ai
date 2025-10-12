# --- 建置階段 (Build Stage) ---
# 使用官方的 Node.js 18 作為建置環境的基礎映像
FROM node:18-alpine AS build-stage

# 在容器內建立一個工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝專案依賴
RUN npm install

# 複製所有前端專案的程式碼
COPY . .

# 執行建置命令，將 Vue 專案編譯成靜態檔案
# 這些檔案會被輸出到 /app/dist 目錄
RUN npm run build

# --- 正式產品階段 (Production Stage) ---
# 使用 Nginx 作為提供靜態檔案服務的伺服器
FROM nginx:stable-alpine AS production-stage

# 從建置階段將編譯好的靜態檔案複製到 Nginx 的預設網站目錄
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 複製我們自訂的 Nginx 設定檔
# (下一步我們會建立這個 nginx.conf 檔案)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 向外部暴露 80 連接埠
EXPOSE 80

# 容器啟動時執行的預設指令 (啟動 Nginx)
CMD ["nginx", "-g", "daemon off;"]