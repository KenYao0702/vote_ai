# 使用官方的 Node.js 18 作為基礎映像
FROM node:18-alpine

# 在容器內建立一個工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json 到工作目錄
# 我們分開複製這兩個檔案，是為了利用 Docker 的層快取機制
# 只有當這兩個檔案變動時，才會重新執行 npm install
COPY package*.json ./

# 安裝專案依賴
RUN npm install

# 複製所有後端專案的程式碼到工作目錄
COPY . .

# 向外部暴露應用程式運行的 3000 連接埠
EXPOSE 3000

# 容器啟動時執行的預設指令
CMD ["/bin/sh", "-c", "npm install && node index.js"]