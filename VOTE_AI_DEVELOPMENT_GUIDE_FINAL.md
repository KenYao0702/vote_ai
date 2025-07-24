# Vote AI 專案：從零到開發的完整指南 (最終版)

**目標：** 在您的電腦上成功設定並執行 `vote_ai` 專案的開發環境。

**核心技術：**
*   **Git & GitHub:** 用於同步和管理我們的程式碼。
*   **Docker & Docker Compose:** 用於建立一個與團隊所有人完全一致的、隔離的開發環境。

---

### **第一步：事前準備 (每個人都只需要做一次)**

在開始之前，請確保您的電腦上已經安裝並設定好以下軟體：

#### **1. 安裝必要軟體**

*   **Git**:
    *   **用途**: 從 GitHub 下載專案程式碼。
    *   **下載**: [https://git-scm.com/downloads](https://git-scm.com/downloads)

*   **Docker Desktop**:
    *   **用途**: 執行我們的開發環境。
    *   **下載**: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
    *   **重要**: 安裝後，請務必**啟動 Docker Desktop**。您需要看到 Docker 的鯨魚圖示穩定顯示在您的系統匣 (Windows 右下角) 或選單列 (macOS 右上角) 中。

*   **VS Code (推薦)**:
    *   **用途**: 撰寫和編輯程式碼。
    *   **下載**: [https://code.visualstudio.com/](https://code.visualstudio.com/)

#### **2. 首次使用 Git 的必要設定**

在您第一次要「提交 (Commit)」程式碼時，Git 需要知道您的「簽名」(姓名和 Email)。這是一個**一次性**的設定，未來在這台電腦上就不用再設定了。

請打開終端機，執行以下**兩個**指令：

*   **設定您的姓名** (會顯示在提交紀錄上):
    ```bash
    git config --global user.name "您的姓名或暱稱"
    ```
    *(請將 `"您的姓名或暱稱"` 換成您自己的名字，例如 `"Ken Yao"`)*

*   **設定您的 Email** (必須是您註冊 GitHub 的 Email):
    ```bash
    git config --global user.email "您在GitHub上使用的Email地址"
    ```
    *(這能讓 GitHub 將您的提交與您的帳號關聯起來)*

---

### **第二步：取得專案並進入資料夾**

1.  **選擇一個您喜歡的位置來存放專案**。例如，在您的家目錄下建立一個 `projects` 資料夾。

2.  **打開您的終端機** (在 Windows 上推薦使用 `Git Bash`，macOS 請用 `Terminal`)。

3.  **從 GitHub 複製 (Clone) 專案程式碼**到您的電腦。請執行以下指令：
    ```bash
    git clone https://github.com/KenYao0702/vote_ai.git
    ```

4.  **進入剛剛下載的專案目錄**。這是**最重要**的一步，後續所有指令都必須在這個資料夾內執行。
    ```bash
    cd vote_ai
    ```

5.  **驗證位置 (可選)**：執行 `ls` (macOS/Git Bash) 或 `dir` (Windows cmd)，您應該能看到 `docker-compose.yml`, `Dockerfile`, `package.json` 等檔案。

---

### **第三步：啟動開發環境**

1.  **確保您仍在 `vote_ai` 資料夾內**。

2.  **執行 Docker Compose 指令來建構並啟動所有服務**：
    ```bash
    docker-compose up --build
    ```

    *   **第一次執行會需要幾分鐘**，因為 Docker 需要下載 Node.js 的基礎映像檔並安裝所有依賴套件。請耐心等候。

3.  **觀察終端機輸出**。當您看到 `Compiled successfully` 並且沒有新的訊息再跳出時，代表開發環境已成功啟動。

---

### **第四步：開始開發！**

1.  **查看應用程式**：
    *   打開您的網頁瀏覽器 (Chrome, Firefox, Edge)。
    *   在網址列輸入：`http://localhost:8080`
    *   您應該能看到正在執行的 `vote_ai` 應用程式。

2.  **即時修改程式碼**：
    *   用 VS Code 打開您電腦上的 `vote_ai` 資料夾。
    *   嘗試修改 `src` 資料夾中的任何 `.vue` 檔案，例如改動一些文字。
    *   **儲存檔案**。瀏覽器中的頁面會**自動重新整理**並顯示您的變更。

3.  **結束開發**：
    *   回到您執行 `docker-compose up` 的那個終端機視窗。
    *   按下 `Ctrl + C`。

---

### **第五步：貢獻您的程式碼**

每天要繼續工作時，您只需要重複以下步驟：

1.  打開終端機，`cd vote_ai` 進入專案目錄。
2.  `git pull` 拉取團隊的最新進度。
3.  `docker-compose up` 啟動開發環境。
4.  開始寫程式！
5.  完成後，使用以下「Git 三步曲」將您的貢獻分享給團隊：

    *   **第一步：加入追蹤** (將所有變更加入暫存區)
        ```bash
        git add .
        ```

    *   **第二步：建立提交** (將變更打包成一個版本)
        ```bash
        git commit -m "在這裡寫下您這次變更的具體說明"
        ```
        *   **注意：** 如果這一步失敗，並提示 `please tell me who you are`，請回到本指南的**第一步**，完成「首次使用 Git 的必要設定」。

    *   **第三步：推送至 GitHub** (將打包好的版本上傳)
        ```bash
        git push
        ```
