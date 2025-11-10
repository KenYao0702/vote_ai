# Vote AI 專案 - v3.0 (Hybrid Architecture Refactor)

## 1. 專案目標

建立一個以區塊鏈為核心的線上投票系統，旨在提供一個安全、透明、不可竄改的投票解決方案，並整合生成式 AI 輔助使用者理解候選人政見。

---

## 2. 架構演進：重構為高效的「混合式架構」

本專案已從「所有資料上鏈」的模式，重構為業界主流的**混合式架構 (Hybrid Architecture)**。這個改變讓專案更具效率、彈性且大幅降低維運成本。

*   **鏈上 (On-Chain):** 僅儲存最核心、最需要安全與共識的資料——**票數**。智能合約的核心職責是作為一個不可竄改的計票器。
*   **鏈下 (Off-Chain):** 儲存所有輔助性、體積較大或常變動的資料。後端伺服器負責管理**候選人詳細資訊**（姓名、政見、圖片、影片連結等），並提供 API 給前端使用。

這種架構兼顧了區塊鏈的安全性與傳統後端的靈活性和效能。

---

## 3. 核心技術棧

*   **智能合約:** Solidity
*   **後端:** Node.js, Express
*   **前端:** Vue.js, Pinia
*   **AI:** Google Gemini
*   **區塊鏈互動:** Ethers.js
*   **本地鏈:** Ganache
*   **開發與部署:** Hardhat, Docker, Docker Compose
*   **資料庫:** lowdb (用於儲存候選人資料、使用者 Email 與錢包地址的對應關係)
*   **身份驗證:** Google OAuth 2.0

---

## 4. 功能開發狀態 (v3.1)

### ✅ 已完成 (DONE)

-   [x] **混合式架構重構**: 智能合約專職計票，後端管理候選人資料，實現了高效的混合式架構。
-   [x] **鏈上選舉生命週期管理**: 管理員可透過前端介面開始/結束投票。
-   [x] **使用者與錢包系統**: 整合 Google OAuth 登入，並由後端為使用者自動管理錢包與測試資金。
-   [x] **前端多媒體支援**: 前端現已支援顯示候選人的照片 (大頭貼) 與嵌入的 YouTube 影片。
-   [x] **AI 功能整合**:
    -   [x] **AI 聊天機器人**: 使用者可透過聊天介面向 AI 提問，了解單一候選人的政見。
    -   [x] **AI 比較分析**: AI 已能理解所有候選人的資料，若使用者提問「請比較所有候選人」，AI 能夠提供綜合分析。
-   [x] **穩定的部署與開發環境**: 全專案 Docker 化，並實現了自動化的部署流程。

### ⬜ 待開發 (TODO)

-   [ ] **候選人上傳介面**: 建立一個讓候選人或管理員能透過圖形化介面，而不是手動編輯 `db.json`，來上傳/修改政見與媒體檔案的前端頁面。
-   [ ] **更完善的前端 UI/UX**: 例如，在資料載入時顯示動畫、更美觀的提示訊息等。

---

## 5. 快速參考：開發地圖與重要網址 (v3.0)

### 重要網址一覽

| 目的 | 網址 | 備註 |
|:---|:---|:---|
| **前端投票與AI頁** | `http://localhost:8080/` | 觀看候選人、投票、與 AI 互動 |
| **前端管理頁** | `http://localhost:8080/admin` | 開始/結束一場選舉 |
| **前端結果頁** | `http://localhost:8080/result` | 投票結束後，查看最終票數 |
| **後端API(候選人)**| `http://localhost:3000/api/candidates`| 從後端讀取候選人資料，並合併鏈上票數 |
| **後端API(AI聊天)**| `http://localhost:3000/api/ai/chat`| (向後端) 發送 AI 聊天問題 |

### 開發地圖

| 當你想... | 你該去修改... | 檔案範例 |
|:---|:---|:---|
| **定義或修改候選人** | `server/db.json` | **可隨時編輯**，重啟伺服器即可生效 |
| **修改智能合約規則** | `blockchain/contracts/Voting.sol` | 例如：修改投票邏輯 |
| **修改後端 API** | `server/index.js` | 例如：新增 API、修改與合約的互動 |
| **修改前端狀態管理** | `src/store/` | `candidates.js`, `user.js`, `aiChat.js` |
| **修改前端頁面外觀** | `src/views/` | `HomePage.vue`, `AdminView.vue` |

---

## 6. 操作流程 (v3.2 修正版)

根據最新的開發環境，請遵循以下步驟以確保專案能順利啟動。

### 第零步：設定環境 (`.env`)

1.  複製 `.env.example` 檔案，並重新命名為 `.env`。
2.  **填寫金鑰**：
    *   `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: 填入您在 Google Cloud Console 建立的 OAuth 2.0 憑證。
    *   `GEMINI_API_KEY`: 填入您在 Google Cloud Console 建立的 API 金鑰。

### 第一步：啟動 Hardhat 本地鏈

1.  打開一個**獨立的終端機**。
2.  **進入 `blockchain` 子目錄**並**安裝其依賴套件**：
    ```bash
    cd vote_ai/blockchain
    npm install
    ```
3.  在**同一個終端機**中，執行指令來啟動本地鏈：
    ```bash
    npx hardhat node
    ```
4.  **重要**：讓這個終端機視窗保持開啟。
5.  啟動後，從輸出的 `Account #0` 中，複製其 **Private Key**。

### 第二步：設定老闆錢包

1.  打開根目錄的 `.env` 檔案。
2.  將 `GANACHE_FUNDER_PRIVATE_KEY` 變數的值，設定為您上一步複製的**第一個私鑰**。

### 第三步：編譯與部署合約

1.  打開**第二個新的終端機**。
2.  **進入 `blockchain` 目錄**：
    ```bash
    cd vote_ai/blockchain
    ```
3.  執行以下指令來編譯與部署合約：
    ```bash
    # 編譯合約
    npx hardhat compile

    # 執行部署腳本
    node simple_deploy.js
    ```
4.  部署成功後，您會看到新的合約位址被印出，並已自動儲存。

### 第四步：啟動應用程式

1.  打開**第三個新的終端機**。
2.  在專案根目錄 (`vote_ai/`) 下，使用 Docker Compose 啟動所有服務。後端服務會**自動讀取**最新的合約位址。
    ```bash
    docker-compose up --build
    ```
3.  等待日誌穩定後，在瀏覽器中打開 `http://localhost:8080` 即可開始使用。

---

## 7. 除錯與 FAQ (v3.0 更新)

*   **問題：執行 `node simple_deploy.js` 時發生 `insufficient funds` (資金不足) 錯誤？**
    *   **解決方案**：請嚴格遵循 **操作流程** 的 **第一步** 和 **第二步**。確保 `.env` 中的 `GANACHE_FUNDER_PRIVATE_KEY` 是從**當前正在運行**的 `ganache-cli` 輸出中複製的。

*   **問題：修改了 `server/db.json` 後，前端頁面沒有更新？**
    *   **原因**：後端服務在啟動時會讀取一次 `db.json`。
    *   **解決方案**：在 `docker-compose` 運行的終端機中，按下 `Ctrl + C` 停止服務，然後重新執行 `docker-compose up` 來重啟後端服務。

*   **問題：AI 聊天功能回報 `404 Not Found` 或 `models/gemini-pro is not found`？**
    *   **原因**：Google Cloud 帳戶的權限問題。
    *   **解決方案**：確認「Generative Language API」已啟用，並使用在 Google Cloud Console 建立的正式 API 金鑰。

*   **問題：登入或呼叫 API 時，瀏覽器顯示 `ERR_CONNECTION_REFUSED`？**
    *   **原因**：後端服務沒有成功啟動。
    *   **解決方案**：檢查 `docker-compose` 的日誌，查看 `backend-1` 服務的輸出，根據錯誤訊息解決問題。

---

## 8. Git 與 GitHub 協作流程

*   **目標：** 確保 `main` 分支永遠是穩定且可部署的，所有新功能都在獨立的分支上開發。

*   **關於 `.gitignore` 和 `.env.example`:**
    *   `.gitignore` 是一個非常重要的檔案，它告訴 Git 哪些檔案或目錄應該被忽略，不應該被版本控制。
    *   `.env.example` 的作用是讓所有組員知道專案需要哪些環境變數。組員可以複製它並重新命名為 `.env`，然後填入自己的敏感資訊。

### 日常開發的 Git 步驟

這是一個典型的開發循環，包含了您提到的「下載、更新、上傳」。

#### 步驟一：首次下載專案 (Clone)

如果您是第一次接觸這個專案，請從 GitHub `clone` (複製) 完整的程式碼庫到您的電腦。

```bash
# 將 <倉庫URL> 替換為實際的 GitHub 網址
git clone https://github.com/KenYao0702/vote_ai.git
cd vote_ai
```

---

#### 步驟二：開始新功能前，先更新本地程式碼 (Update)

在您要開始寫任何新功能或修復 bug **之前**，請務必先將您本地的 `main` 分支與遠端的 `main` 分支同步，確保您的基礎是最新版本。

```bash
# 1. 切換回你的 main 分支
git checkout main

# 2. 從遠端倉庫 (origin) 的 main 分支，拉取 (pull) 最新的變更
git pull origin main
```

---

#### 步驟三：為您的變更建立一個新分支 (Branch)

所有新的開發工作，都應該在一個獨立的「功能分支」上進行，以避免污染穩定 `main` 分支。分支名稱應該簡短且有描述性 (例如：`feature/user-profile-page`, `fix/login-button-bug`)。

```bash
# 從當前最新的 main 分支，建立一個名為 <branch-name> 的新分支，並立即切換過去
git checkout -b <branch-name>
```

---

#### 步驟四：在本地開發並提交您的變更 (Commit)

現在您可以在這個新的分支上，自由地修改、新增、或刪除檔案了。當您完成一個小段落的工作後，就應該建立一個「提交」(commit)。

```bash
# 1. 將您所有變更的檔案加入到「暫存區」
git add .

# 2. 建立一個「提交」，並附上一段清晰的說明
# 範例: git commit -m "feat: Add countdown timer to homepage"
# 範例: git commit -m "fix: Correct admin check logic in router"
git commit -m "<類型>: <您的變更說明>"
```

---

#### 步驟五：上傳您的分支到 GitHub (Upload)

當您在本地完成開發，並建立了一或多個 commit 後，就可以將您的整個分支上傳到 GitHub，以便其他人可以看到您的程式碼，並進行審查 (Code Review)。

```bash
# 將您本地的 <branch-name> 分支，推送到名為 origin 的遠端倉庫
# -u 參數只需要在第一次推送新分支時使用
git push -u origin <branch-name>
```

---

#### 步驟六：建立合併請求 (Pull Request)

推送成功後，打開您的瀏覽器，進入專案的 GitHub 頁面。您會看到一個黃色的提示框，建議您為剛剛推送的分支建立一個「Pull Request」(簡稱 PR)。

1.  點擊按鈕，建立一個 PR。
2.  PR 的目標應該是 `main` 分支。
3.  在 PR 的描述中，清楚地說明您完成了什麼功能、修復了什麼問題。
4.  在右邊的 `Reviewers` 欄位，指派至少一位團隊成員來審查您的程式碼。

---

#### 步驟七：審查與合併

您的團隊成員會審查您的 PR。如果他們提出修改建議，您只需要在本地的同一個分支上繼續修改、commit、然後再次 `git push`，PR 就會自動更新。

當您的 PR 被批准後，就可以將它合併 (Merge) 到 `main` 分支中了。合併後，您可以安全地刪除這個已經完成任務的功能分支。

---

## 9. 管理員操作指南 (Administrator's Guide)

管理員負責選舉的準備與生命週期管理。

### 階段一：選舉開始前 (準備工作)

1.  **指定管理員權限**:
    *   打開後端原始碼檔案： `server/index.js`。
    *   找到 `ADMIN_EMAILS` 這個常數陣列。
    *   將被授權為管理員的 Google 帳號 Email 填入此陣列。

2.  **定義選舉候選人**:
    *   打開後端資料檔案： `server/db.json`。
    *   手動編輯 `candidates` 陣列，填入本次選舉所有候選人的 `name` (姓名) 和 `platform` (政見)。

### 階段二：(選用) 新增候選人媒體

您可以為每位候選人加上照片與宣傳影片，豐富頁面內容。

1.  **新增照片 (本地開發)**:
    *   在專案的 `public` 資料夾中，建立一個名為 `images` 的新資料夾。
    *   將您的候選人照片 (例如 `candidate-A.jpg`) 放入 `public/images` 資料夾中。
    *   打開 `server/db.json`，在對應的候選人物件中，新增 `imageUrl` 欄位，值為圖片的**相對路徑**，例如：`"/images/candidate-A.jpg"`。

2.  **新增影片**:
    *   將您的影片上傳到 YouTube 或其他影片平台。
    *   取得該影片的**嵌入 (Embed)** 連結。通常在影片的「分享」選項中可以找到，格式會像 `https://www.youtube.com/embed/VIDEO_ID`。
    *   打開 `server/db.json`，在對應的候選人物件中，新增 `videoUrl` 欄位，值為您取得的嵌入連結。

3.  **範例 `db.json`**:
    ```json
    {
      "id": "candidate123",
      "name": "候選人A",
      "platform": "我的政見...",
      "imageUrl": "/images/candidate-A.jpg",
      "videoUrl": "https://www.youtube.com/embed/your-video-id"
    }
    ```

4.  **重啟服務**:
    *   每當您修改 `server/db.json` 或新增圖片檔案後，都需要重啟 Docker 服務來讓變更生效。
    *   請回到運行 `docker-compose` 的終端機，按下 `Ctrl + C`，然後重新執行 `docker-compose up --build`。

    ### 階段三：選舉管理 (啟動與監控)

1.  **啟動專案**:
    *   依照 `## 6. 操作流程` 中的步驟，完整啟動所有服務 (Ganache, Docker Compose)。

2.  **登入管理員帳號**:
    *   在瀏覽器中打開 `http://localhost:8080`。
    *   點擊登入，並使用您在階段一指定的**管理員 Google 帳號**進行登入。

3.  **進入管理面板**:
    *   登入成功後，在瀏覽器的網址列手動導航至 `http://localhost:8080/admin`。

4.  **控制選舉狀態**:
    *   在管理面板上，您可以看到控制選舉的介面。
    *   **開始投票**: 點擊按鈕並輸入本次投票的持續時間（以分鐘為單位）。
    *   **結束投票**: 在投票進行中，可隨時點擊按鈕以提前結束投票。