# Vote AI 專案狀態與開發計畫

## 1. 專案目標

建立一個結合 AI 與區塊鏈技術的線上投票系統，旨在提供一個安全、透明且不可竄改的投票解決方案。

## 2. 核心技術棧

*   **後端:** Node.js, Express
*   **前端:** Vue.js, Pinia, Nginx (用於靜態檔案服務)
*   **資料庫:** lowdb (基於 JSON 檔案的簡易資料庫)
*   **身份驗證:** Google OAuth 2.0
*   **容器化:** Docker, Docker Compose
*   **版本控制:** Git, GitHub

---

## 3. 功能開發狀態

### ✅ 已完成 (DONE)

-   [x] **使用者身份驗證系統**
    -   [x] 使用者可透過 Google OAuth 2.0 登入
    -   [x] 使用者可以登出
    -   [x] 前端可持續化使用者登入狀態 (Pinia + localStorage)
    -   [x] 後端成功處理 Google 認證流程並導回前端

-   [x] **基本前端介面 (UI)**
    -   [x] 具備顯示候選人列表的頁面雛形
    -   [x] 頁面包含登入/登出按鈕
    -   [x] 頁面包含投票按鈕 (功能已與後端連接)

-   [x] **容器化開發環境 (Docker)**
    -   [x] 為後端建立 `Dockerfile`
    -   [x] 為前端建立 `Dockerfile`
    -   [x] 建立 `docker-compose.yml` 以整合前後端服務

-   [x] **核心投票後端邏輯**
    -   [x] 建立後端資料庫 (`db.json`) 以儲存候選人與票數
    -   [x] 開發 API: `GET /api/candidates` (獲取候選人列表)
    -   [x] 開發 API: `POST /api/vote/:candidateId` (接收並記錄投票)

-   [x] **前後端功能串接**
    -   [x] 前端呼叫後端 API 來獲取真實的候選人資料
    -   [x] 前端點擊投票按鈕後，將請求發送到後端 API

-   [x] **區塊鏈整合**
    -   [x] 安裝 Ganache CLI
    -   [x] 撰寫 Solidity 智能合約 (`Voting.sol`)
    -   [x] 編譯智能合約 (使用 Hardhat)
    -   [x] 部署智能合約到 Ganache
    -   [x] 後端整合 `ethers.js` 與智能合約互動 (投票時記錄到區塊鏈)
    -   [x] **(臨時解決方案)** 智能合約已註釋掉「每個地址只能投票一次」的限制，以便測試。

### ⬜ 待開發 (TODO)

-   [ ] **管理員後台功能**
    -   [ ] 開發管理員專用介面
    -   [ ] 開發 API 供管理員新增/編輯候選人或選舉活動

-   [ ] **AI 功能整合**
    -   [ ] 根據專題計畫書，設計並開發 AI 相關功能 (如：趨勢分析、異常偵測)

-   [ ] **完善區塊鏈整合**
    -   [ ] 實現每個 Google 帳號對應一個區塊鏈地址的邏輯，並確保單次投票限制。
    -   [ ] 從智能合約讀取投票結果，作為最終數據源。

---

## 4. 使用說明

專案啟動後，您可以透過以下網址訪問前後端服務：

*   **前端 (Frontend):** `http://localhost:8080`
*   **後端 (Backend):** `http://localhost:3000`

## 5. 後續開發藍圖 (Roadmap)

**🚀 第零階段：建立 Docker 開發環境 (已完成)**
1.  在 `server` 目錄下為後端應用建立 `Dockerfile`。
2.  在 `vote_ai` 根目錄下為前端應用建立 `Dockerfile`。
3.  在 `vote_ai` 根目錄下建立 `docker-compose.yml`，定義 `backend` 和 `frontend` 服務，並設定好網路、連接埠與 volume mounts，實現 `docker-compose up` 一鍵啟動。

**階段一：實現核心投票功能 (後端) (已完成)**
1.  在 `server` 中安裝 `lowdb`。
2.  修改 `server/index.js`，在啟動時初始化 `db.json`。
3.  開發 `GET /api/candidates` 和 `POST /api/vote/:candidateId` 兩個 API 端點。

**階段二：串接前後端投票功能 (已完成)**
1.  修改前端 `candidates` store，使其 `actions` (獲取候選人、投票) 透過 `fetch` 或 `axios` 呼叫後端 API。
2.  確保前端介面能正確顯示從後端來的真實票數，並在投票後刷新。

**階段三：整合區塊鏈 (已完成)**
1.  安裝 Ganache CLI。
2.  撰寫 Solidity 智能合約。
3.  編譯智能合約 (使用 Hardhat)。
4.  部署智能合約到 Ganache。
5.  後端安裝 `ethers.js`，並在投票 API 中增加與智能合約互動的邏輯。

**階段四：開發管理員與 AI 功能**
1.  擴充前後端，增加管理員相關的路由和頁面。
2.  研究並整合 AI 模型。

---

## 6. 操作流程與團隊協作指南

為了讓所有組員都能在一致的環境中高效協作，並確保程式碼品質，我們將採用 **Docker** 搭配 **GitHub Flow** 的模式。

### 6.1 環境準備與專案啟動

*   **目標：** 解決「在我電腦上可以跑，在你電腦上卻不行」的問題。透過容器化，確保每位組員都在完全相同的環境中進行開發與測試。
*   **核心檔案：**
    *   `vote_ai/server/Dockerfile`: 用於建置後端服務的映像。
    *   `vote_ai/Dockerfile`: 用於建置前端服務的映像。
    *   `vote_ai/docker-compose.yml`: 用於定義和啟動整個專案（包含前後端）的總指揮檔案。

*   **給組員的操作流程：**

    **1. 環境準備 (只需做一次):**
    *   確保你的電腦已安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop/) 並已在背景執行。
    *   使用 Git `clone` 專案到你的本地電腦。**請使用以下指令，並將 `<你的專案GitHub-URL>` 替換為實際的倉庫網址：`https://github.com/KenYao0702/vote_ai.git`**
        ```bash
        git clone https://github.com/KenYao0702/vote_ai.git
        cd vote_ai
        ```
    *   **設定環境變數 (.env 檔案):**
        *   專案中包含一個 `.env.example` 檔案，它列出了所有必要的環境變數。
        *   **請複製 `vote_ai/.env.example` 檔案，並將副本重新命名為 `vote_ai/.env`。**
        *   然後，請向專案負責人索取 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 的真實值，並填入你的 `vote_ai/.env` 檔案中。**這個 `.env` 檔案不應該被提交到 Git 倉庫。**
    *   **設定 Git 換行符 (Windows 用戶尤其重要):**
        *   為了避免跨平台換行符問題，請在專案根目錄 (`vote_ai/`) 下執行以下命令，確保 Git 正確處理換行符：
            ```bash
            git rm --cached -r .
            git reset --hard HEAD
            ```

    *   **設定區塊鏈環境 (Ganache & 智能合約部署):**
        *   **安裝 Ganache CLI:** 如果尚未安裝，請全域安裝 Ganache CLI。
            ```bash
            npm install -g ganache-cli
            ```
        *   **啟動 Ganache CLI:** 在一個獨立的終端機視窗中，啟動 Ganache。請確保它運行在 `8545` 埠。
            ```bash
            ganache-cli -p 8545 -m "test test test test test test test test test test test test"
            ```
            *   **注意：** 保持此終端機視窗開啟，Ganache 服務將持續運行。
        *   **編譯與部署智能合約:**
            *   進入 `blockchain` 目錄：
                ```bash
                cd blockchain
                ```
            *   安裝 Hardhat 依賴 (如果尚未安裝):
                ```bash
                npm install
                ```
            *   編譯智能合約：
                ```bash
                npx hardhat compile
                ```
            *   部署智能合約到 Ganache：
                ```bash
                npx hardhat run scripts/deploy.js --network ganache
                ```
            *   部署成功後，你會在終端機中看到合約地址。**請將部署成功後輸出的合約地址，以及 Ganache 啟動時顯示的第一個帳戶私鑰，更新到自己本地的 `server/index.js` 檔案中。** 這是確保後端能正確與本地區塊鏈互動的關鍵步驟。
            *   **同時，請確保 `blockchain/hardhat.config.js` 中的 `networks.ganache.accounts` 陣列也更新為 Ganache 啟動時顯示的第一個帳戶私鑰。**
            *   完成後，返回專案根目錄：
                ```bash
                cd ..
                ```

    **2. 啟動專案 (日常開發使用):**
    *   在專案的根目錄 (`vote_ai/`) 下，執行以下指令來建置並啟動所有服務：
        ```bash
        docker-compose up --build -d
        ```
        *   `--build` 參數會確保 Docker 在啟動前，會根據 `Dockerfile` 的任何變動重新建置映像。日常開發中，如果 `Dockerfile` 沒有變動，可以省略 `--build`，單純使用 `docker-compose up -d`。

    **3. 查看服務狀態：**
    *   執行 `docker-compose ps` 後，你將在終端機中看到來自前端和後端服務的即時日誌 (logs)。
    *   **前端服務:** 預計在 `http://localhost:8080` 上運行。
    *   **後端服務:** 預計在 `http://localhost:3000` 上運行。

    **4. 停止專案：**
    *   在同一個終端機視窗中，按下 `Ctrl + C`。
    *   Docker Compose 會優雅地停止所有正在運行的容器。
    *   若要在背景停止並移除容器，可以執行：
        ```bash
        docker-compose down
        ```

    **5. 熱重載 (Hot Reloading):**
    *   我們已在 `docker-compose.yml` 中設定了 `volumes`，將本地的程式碼目錄掛載 (mount) 到容器中。
    *   這代表你在本地的 IDE (如 VS Code) 中修改並儲存程式碼時，容器內的應用程式會**自動重啟**，你無需手動重新建置或重啟容器，只需刷新瀏覽器即可看到變更。

### 6.2 Git 與 GitHub 協作流程

*   **目標：** 確保 `main` 分支永遠是穩定且可部署的，所有新功能都在獨立的分支上開發。

*   **關於 `.gitignore` 和 `.env.example`:**
    *   `.gitignore` 是一個非常重要的檔案，它告訴 Git 哪些檔案或目錄應該被忽略，不應該被版本控制。
    *   **為什麼需要它？** 專案中通常會包含一些不應該被提交到 Git 倉庫的檔案，例如：
        *   **敏感資訊：** 像是 API 金鑰、資料庫密碼等，通常儲存在 `.env` 檔案中。這些資訊一旦上傳到公共倉庫，會造成嚴重的安全風險。因此，`.env` 檔案已被加入 `.gitignore`。
        *   **自動生成檔案：** 例如 `node_modules` (安裝的依賴套件)、編譯後的輸出檔案 (`dist` 目錄)。這些檔案通常很大，且可以透過指令重新生成，不需要納入版本控制。
        *   **個人設定：** IDE 的設定檔、日誌檔等，這些是個人開發環境的配置，不應影響團隊成員。
    *   **如何使用？** 在 `.gitignore` 檔案中，每一行代表一個要忽略的模式（檔案名、目錄名或萬用字元模式）。例如，我們在專案根目錄的 `.gitignore` 中加入了 `.env` 和 `node_modules`，確保這些檔案不會被意外提交。
    *   **`.env.example` 的作用：** 為了讓所有組員知道專案需要哪些環境變數，我們提供了 `.env.example` 檔案。這個檔案會被提交到 Git 倉庫，組員可以複製它並重新命名為 `.env`，然後填入自己的敏感資訊。

*   **流程：**

    **1. 更新本地 `main` 分支 (下載最新程式碼):** 在開始新功能前，永遠先確保你的 `main` 分支是最新版本。
        *   **指令：**
            ```bash
            git checkout main
            git pull origin main
            ```
        *   **說明：**
            *   `git checkout main`: 切換到本地的 `main` 分支。
            *   `git pull origin main`: 從名為 `origin` 的遠端倉庫（即 `https://github.com/KenYao0702/vote_ai.git`）的 `main` 分支拉取最新的變更，並合併到你當前的本地 `main` 分支。這確保你的本地 `main` 分支與遠端倉庫保持同步。

    **2. 從 `main` 建立分支 (Branch):**
        *   當要開發新功能或修復 bug 時，永遠從最新的 `main` 分支建立一個新的、有意義命名的分支 (e.g., `feature/backend-api`, `fix/login-bug`)。
        *   **指令：**
            ```bash
            git checkout -b <branch-name>
            ```
        *   **說明：**
            *   `git checkout -b <branch-name>`: 建立一個名為 `<branch-name>` 的新分支，並立即切換到這個新分支。所有後續的開發都將在這個分支上進行，不會影響到 `main` 分支。

    **3. 本地開發與提交 (Commit):**
        *   在新建的分支上進行開發和修改。
        *   完成一個小段落或功能後，使用 `git add` 將相關檔案加入暫存區，再用 `git commit` 提交。
        *   **指令：**
            ```bash
            # 將特定檔案加入暫存
            git add path/to/your/file.js

            # 或將所有變動的檔案加入暫存
            git add .

            # 提交變更並撰寫清晰的訊息
            git commit -m "feat: Implement user login API"
            ```
        *   **說明：**
            *   `git add`: 將你修改或新增的檔案添加到 Git 的「暫存區」。只有在暫存區的檔案才會被 `git commit` 記錄。
            *   `git commit -m "<message>"`: 將暫存區的變更永久記錄到本地倉庫的歷史中。`-m` 後面是本次提交的簡短描述，請務必寫得清晰明瞭。

    **4. 推送分支到 GitHub (上傳程式碼):**
        *   當分支上的功能開發完成後，將該分支 `push` 到 GitHub。
        *   **指令：**
            ```bash
            # 第一次推送新分支時，需要設定上游分支
            git push -u origin <branch-name>

            # 之後的推送，可以直接使用
            git push origin <branch-name>
            ```
        *   **說明：**
            *   `git push origin <branch-name>`: 將你本地 `<branch-name>` 分支上的所有提交推送到名為 `origin` 的遠端倉庫（即 `https://github.com/KenYao0702/vote_ai.git`）的同名分支上。這會讓你的變更在 GitHub 上可見。
            *   `-u` 參數 (或 `--set-upstream`) 只在第一次推送新分支時使用，它會將本地分支與遠端分支建立連結，這樣以後你就可以直接使用 `git push` 而無需指定 `origin <branch-name>`。
        *   在 GitHub 專案頁面上，針對你的分支發起一個 Pull Request (PR) 到 `main` 分支。在 PR 的描述中，清楚說明你做了什麼。

    **5. 程式碼審查與討論 (Code Review):**
        *   邀請其他組員審查你的 PR。他們可以在 GitHub 的介面上針對特定程式碼行進行評論。
        *   如果審查者提出修改建議，你可以在本地的同一個分支上繼續修改、commit、並再次 push，PR 會自動更新。

    **6. 合併到主分支 (Merge):**
        *   在 PR 被至少一位組員批准 (Approve) 且通過所有自動化檢查後，由專案負責人或你自己將其合併到 `main` 分支。
        *   合併後，可以安全地刪除已經合併的 feature 分支。

### 6.3 常見問題與解決方案

*   **問題：`Error: listen tcp 0.0.0.0:3000: bind: address already in use` (或任何其他連接埠被佔用)**
    *   **原因：** 你的電腦上已經有另一個程式正在使用 Docker 嘗試使用的連接埠 (例如 3000 或 8080)。這通常發生在你之前手動啟動過後端或前端服務，但沒有正確關閉它們。
    *   **解決方案：**
        1.  找出佔用該連接埠的程序 PID (Process ID)。
            ```bash
            # 以 3000 連接埠為例
            lsof -i :3000
            ```
        2.  記下 `PID` 欄位中的數字。
        3.  終止該程序。
            ```bash
            kill <PID>
            # 例如：kill 7941
            ```
        4.  再次嘗試啟動 Docker Compose。
            ```bash
            docker-compose up --build
            ```

*   **問題：`docker-compose up --build` 失敗，提示 `npm install` 或 `npm run build` 錯誤**
    *   **原因：** 這通常表示 `package.json` 或 `package-lock.json` 中有問題，或者依賴安裝失敗。可能是網路問題、依賴版本不相容，或是程式碼本身有語法錯誤導致 `npm run build` 失敗。
    *   **解決方案：**
        1.  仔細閱讀錯誤訊息，通常會指出具體的問題。
        2.  嘗試在本地環境（如果已安裝 Node.js）手動執行 `npm install` 或 `npm run build`，看看是否能重現問題並獲得更詳細的錯誤輸出。
        3.  檢查 `Dockerfile` 和 `docker-compose.yml` 中的路徑和指令是否正確。
        4.  確保你的網路連接正常。

*   **問題：Git 合併衝突 (Merge Conflict)**
    *   **原因：** 當兩個或多個組員修改了同一個檔案的同一部分，並且這些修改在合併時無法自動解決時，就會發生合併衝突。
    *   **解決方案：**
        1.  當 `git pull` 或 `git merge` 提示衝突時，Git 會在衝突的檔案中標記出衝突的部分 (例如 `<<<<<<<`, `=======`, `>>>>>>>`)。
        2.  手動編輯這些檔案，選擇你想要保留的程式碼（或結合兩者的修改），並刪除 Git 插入的衝突標記。
        3.  解決所有衝突後，使用 `git add <解決衝突的檔案>` 將檔案標記為已解決。
        4.  最後，使用 `git commit` 完成合併。如果是在 PR 中解決衝突，通常會自動更新 PR。

*   **問題：後端容器無法連接到 Ganache (ECONNREFUSED 127.0.0.1:8545)**
    *   **原因：** 當後端容器運行在 Docker Compose 的橋接網路中時，它無法透過 `127.0.0.1` 訪問運行在您主機上的 Ganache。在 macOS 或 Windows 上，容器需要使用 `host.docker.internal` 來訪問主機上的服務。
    *   **解決方案：**
        1.  修改 `server/index.js`：將 `ethers.JsonRpcProvider` 的 URL 從 `http://127.0.0.1:8545` 修改為 `http://host.docker.internal:8545`。
        2.  重新建置並啟動服務：`docker-compose up --build -d`。

*   **問題：前端無法連接到後端 (localhost 拒絕連線 / Failed to fetch)**
    *   **原因：** 當前端應用程式在瀏覽器中運行時，它是在您的主機上執行的。因此，前端的 JavaScript 程式碼在發送 API 請求時，需要連接到主機上後端服務所映射的埠。如果前端嘗試使用 Docker 內部網路的服務名稱（例如 `http://backend:3000`），瀏覽器將無法解析。
    *   **解決方案：**
        1.  修改 `src/store/candidates.js`：將所有對 `http://backend:3000` 的 API 呼叫改回 `http://localhost:3000`。
        2.  修改 `src/App.vue`：將 Google 認證的 `backendAuthUrl` 從 `http://backend:3000/auth/google` 改回 `http://localhost:3000/auth/google`。
        3.  重新建置並啟動服務：`docker-compose up --build -d`。

*   **問題：環境變數未載入 (The "GOOGLE_CLIENT_ID" variable is not set)**
    *   **原因：** Docker Compose 的 `env_file` 配置可能沒有正確地將 `.env` 檔案載入到容器中，或者 `dotenv` 庫本身在容器啟動時沒有正確地找到 `.env` 檔案。
    *   **解決方案：**
        1.  將 `vote_ai/server/.env` 移動到 `vote_ai/.env` (專案根目錄)。
        2.  修改 `docker-compose.yml`：移除 `backend` 服務的 `environment` 區塊，並加入 `env_file: ./.env`。
        3.  重新建置並啟動服務：`docker-compose up --build -d`。

*   **問題：前端 `npm run build` 失敗 (Syntax Error / Cannot read properties of null)**
    *   **原因：** 通常是 Vue 模板或腳本中的語法錯誤，例如缺少逗號。
    *   **解決方案：**
        1.  仔細檢查錯誤訊息中提到的檔案和行號。
        2.  修正語法錯誤，例如在 `src/App.vue` 的 `return` 語句中，`backendAuthUrl` 後面缺少逗號。
        3.  重新建置並啟動服務：`docker-compose up --build -d`。

---

## 7. 最新配置更新說明

為了優化團隊協作體驗並解決跨平台問題，我們對專案配置進行了以下重要更新：

### 7.1 環境變數管理 (`.env` 與 `.env.example`)

*   **問題：** 敏感資訊（如 API 金鑰）不應直接提交到 Git 倉庫，但團隊成員需要這些配置才能運行專案。
*   **解決方案：**
    *   引入 `.env.example` 檔案，它包含了所有必要的環境變數名稱，但值為空或範例值。這個檔案會被提交到 Git。
    *   `.env` 檔案（包含實際敏感值）已被加入 `.gitignore`，確保其不會被意外提交。
*   **組員操作：**
    1.  複製 `.env.example` 並重新命名為 `.env`。
    2.  向專案負責人索取實際的 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 值，並填入自己的 `.env` 檔案中。

### 7.2 跨平台換行符問題 (`.gitattributes`)

*   **問題：** Windows 和 macOS/Linux 使用不同的換行符，導致 Docker 執行腳本時可能出現錯誤。
*   **解決方案：**
    *   引入 `.gitattributes` 檔案，強制 Git 在所有平台上使用統一的 `LF` (Unix-style) 換行符。
*   **組員操作：**
    1.  在 `git clone` 或 `git pull` 後，在專案根目錄執行以下命令，以確保 Git 正確處理換行符：
        ```bash
        git rm --cached -r .
        git reset --hard HEAD
        ```

### 7.3 區塊鏈環境配置 (`Ganache` & 智能合約)

*   **問題：** 不同的 Ganache 實例會生成不同的帳戶和私鑰，導致部署的智能合約地址不一致，後端無法正確連接。
*   **解決方案：**
    *   **Ganache 啟動：** 統一使用固定的助記詞啟動 Ganache，確保所有組員的 Ganache 實例生成相同的帳戶和私鑰。
        ```bash
        ganache-cli -p 8545 -m "test test test test test test test test test test test test"
        ```
    *   **Hardhat 配置：** `blockchain/hardhat.config.js` 中的 `ganache` 網路配置已更新，使用與固定助記詞對應的第一個帳戶私鑰。
    *   **後端連接：** `server/index.js` 中的智能合約地址和用於簽名的私鑰已更新為最新部署的合約地址和對應的私鑰。
*   **組員操作：**
    1.  **務必**使用上述帶有助記詞的命令啟動 Ganache。
    2.  **部署智能合約後，請將部署成功後輸出的合約地址，以及 Ganache 啟動時顯示的第一個帳戶私鑰，更新到自己本地的 `server/index.js` 檔案中。** 這是確保後端能正確與本地區塊鏈互動的關鍵步驟。

### 7.4 Node.js 版本建議

*   **問題：** Hardhat 對 Node.js 版本有特定要求，使用不支援的版本可能導致部署失敗。
*   **解決方案：** 建議使用 Hardhat 支援的 Node.js LTS 版本（例如 Node.js 18.x 或 20.x）。
*   **組員操作：**
    1.  如果遇到 Node.js 版本警告，請使用 `nvm` (Node Version Manager) 切換到推薦的 LTS 版本。
    2.  切換版本後，在 `blockchain` 目錄下重新執行 `npm install`.
