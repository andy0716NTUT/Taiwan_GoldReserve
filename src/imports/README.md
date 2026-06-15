# Taiwan GoldReserve Academy

台灣黃金 RWA 互動式教學沙盒。這是一個期末展示用 PoC，幫助學生理解：

- `1 GGT = 1 gram gold` 的 RWA 映射概念
- Proof-of-Reserve 如何把鏈下文件與鏈上紀錄連接起來
- 為什麼 RWA 需要 whitelist、freeze、pause 與角色權限
- mint、burn redemption 與鏈下交割之間的差異

> 本專案為教學展示，不構成投資建議，也不宣稱已符合正式金融商品、證券、商品或虛擬資產法規。

## Files

- `index.html`：學生 / 投資人展示頁
- `admin.html`：老師 / 管理者操作台
- `src/js/i18n.js`：繁中 / 英文語言切換
- `src/css/styles.css`：共用視覺樣式
- `src/js/core.js`：儲備率、proof hash、本地狀態與任務邏輯
- `src/js/requests.js`：申購與贖回請求流程
- `src/js/app.js`：學生端 dashboard
- `src/js/admin.js`：管理者端 console
- `assets/gold-reserve.svg`：黃金儲備視覺素材
- `contracts/GoldReserveToken.sol`：教學版 Solidity 合約草稿
- `docs/FEATURE_BACKLOG.md`：尚未實現與建議優先實作功能
- `docs/screenshots/`：本地驗證截圖
- `Taiwan_GoldReserve_Project_Proposal.md.docx`：原始 proposal

## Run

直接用瀏覽器開啟：

```text
index.html
admin.html
```

或用任何靜態伺服器服務此資料夾。系統會使用 `localStorage` 保存 demo 狀態，所以在同一個瀏覽器中操作 `admin.html` 後，回到 `index.html` 會看到更新。

## Demo Flow

1. 在 `index.html` 查看 learning dashboard、儲備覆蓋率與 proof hash。
2. 打開 `admin.html`，完成任務：
   - 更新 proof-of-reserve
   - 加入 whitelist
   - mint GGT
   - freeze / pause
   - burn for redemption
3. 回到 `index.html` 查看 audit timeline、事件紀錄、任務完成度與小測驗。

## i18n

網站所有主要靜態與動態文案都集中在 `src/js/i18n.js`：

- HTML 使用 `data-i18n`、`data-i18n-alt`、`data-i18n-aria-label` 指向翻譯 key。
- `app.js`、`admin.js`、`core.js`、`requests.js` 透過 `window.GoldReserveI18n.t()` 取得動態文字。
- 語言設定保存在 `localStorage`，因此 `index.html` 與 `admin.html` 會共用同一個繁中 / 英文選擇。

## Onchain Scope

前端目前是本地互動教學沙盒，不會自動送出 Sepolia 交易，也不會要求私鑰。`contracts/GoldReserveToken.sol` 提供合約設計草稿，可作為後續部署 Sepolia 的起點。

正式接上鏈時，建議下一步：

- 使用 OpenZeppelin ERC-20 / AccessControl / Pausable
- 補 Hardhat 或 Foundry 測試
- 使用多簽管理 Owner / Issuer / Auditor 權限
- 僅把 reserve grams、supply、proof hash、事件與角色狀態放上鏈
- 完整審計報告、KYC、保管文件與贖回文件留在鏈下
