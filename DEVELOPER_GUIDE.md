# Vote AI 專案團隊協作流程

大家好，為了統一我們團隊的開發環境，避免因為每個人的電腦設定不同而產生問題，我們將使用 GitHub 和 Docker 來進行協作。

請大家嚴格遵循以下流程來設定和開發專案。

---

### **第一步：事前準備 (每個人都只需要做一次)**

在開始之前，請確保您的電腦上已經安裝好以下軟體：

1.  **Git**: 用來管理和同步我們的程式碼。
    - 下載連結：[https://git-scm.com/downloads](https://git-scm.com/downloads)
2.  **Docker Desktop**: 用來建立和管理我們統一的開發環境。
    - 下載連結：[https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
3.  **VS Code (推薦)**: 或任何您習慣的程式碼編輯器。

---

### **第二步：第一次設定專案 (第一次加入專案時操作)**

1.  **打開您的終端機 (Terminal)**。

2.  **從 GitHub 複製專案程式碼**，請執行以下指令：

    ```bash
    git clone https://github.com/KenYao0702/vote_ai.git
    ```

3.  **進入專案目錄**：

    ```bash
    cd vote_ai
    ```

4.  **使用 Docker Compose 建構並啟動開發環境**：

    ```bash
    docker-compose up --build
    ```

    - **注意：** 第一次執行這個指令會需要幾分鐘時間，因為 Docker 需要下載 Node.js 的基礎映像檔並安裝所有專案依賴套件。請耐心等候直到終端機顯示 `Compiled successfully`。

5.  **設定完成！** 您現在可以在瀏覽器中打開 `http://localhost:8080`，應該就能看到正在執行的 `vote_ai` 應用程式了。

---

### **第三步：日常開發流程**

每天要開始工作時，請這樣做：

1.  **打開終端機，進入專案目錄**：

    ```bash
    cd path/to/your/vote_ai
    ```

2.  **從 GitHub 拉取最新的程式碼**，確保與團隊同步：

    ```bash
    git pull
    ```

3.  **啟動開發環境**：

    ```bash
    docker-compose up
    ```

4.  **開始寫程式**：

    - 用 VS Code 打開 `vote_ai` 資料夾。
    - 直接修改任何專案檔案。
    - 當您儲存檔案時，Docker 容器內的開發伺服器會「熱重載 (Hot-Reload)」，您在瀏覽器 `http://localhost:8080` 上看到的頁面會自動更新。

5.  **結束工作**：
    - 在執行 `docker-compose up` 的終端機視窗中，按下 `Ctrl + C` 即可停止開發環境。

---

### **第四步：貢獻您的程式碼**

當您完成一個功能或修復一個錯誤後，請將您的程式碼貢獻回團隊：

1.  **將您的變更加入到 Git**：

    ```bash
    git add .
    ```

2.  **為您的變更建立一個清楚的「提交訊息」**：

    ```bash
    git commit -m "feat: 完成使用者登入頁面"
    ```

    - (請將引號內的文字換成對您這次修改的具體描述)

3.  **將您的程式碼推送到 GitHub**：
    ```bash
    git push
    ```

---

**總結：** 我們的協作模式是：**用 `Git` 來同步程式碼，用 `Docker` 來執行程式碼**。這樣可以確保我們每個人都在完全相同的環境下工作，大幅減少「在我的電腦上可以跑，但在你的電腦上不行」的窘境。
