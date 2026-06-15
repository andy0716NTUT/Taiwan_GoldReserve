# Feature Backlog

## 已實現

- i18n 語言切換：繁中 / 英文，可在 `index.html` 與 `admin.html` 共用同一個語言設定。
- Learning Dashboard：儲備量、總發行量、覆蓋率、proof version、proof hash。
- Proof-of-Reserve 教學模組：鏈上 / 鏈下資料分工、儲備與發行量比較。
- Instructor Console：更新 proof、白名單、mint、freeze、pause、burn redemption。
- Mission-Based Demo：六個課堂任務進度。
- Role-Playing Journey：Investor、Compliance、Auditor、Issuer、Custodian 流程。
- Compliance & Risk Panel：KYC、白名單、凍結、暫停、demo 法規定位。
- Learning Check：五題小測驗。
- 本地申購 / 贖回請求：使用 `localStorage` 保存 request hash。
- 教學版 Solidity 合約草稿：`contracts/GoldReserveToken.sol`。

## 尚未實現

- 真正部署到 Sepolia 的智能合約。
- 前端尚未把 `mintByReserve()`、`updateReserveProof()`、`setWhitelist()`、`burnForRedemption()` 實際送到鏈上。
- 尚未讀取 Sepolia 合約狀態來取代本地 `localStorage` demo state。
- 尚未產生 Etherscan transaction link 與 onchain verification result。
- 尚未使用 OpenZeppelin ERC-20、AccessControl、Pausable 或 ERC-3643 類 permissioned token standard。
- 尚未加入 Hardhat / Foundry 測試、合約部署腳本與安全檢查。
- 尚未有後端或資料庫保存學生進度、任務紀錄、申購 / 贖回 request。
- 尚未有文件 hash registry、IPFS / Arweave 文件指標或審計者簽章流程。
- 尚未有金條批次資料模型，例如 serial number、purity、vault batch。
- 尚未有 Chainlink 或 mock gold price oracle。
- 尚未有完整 KYC provider mock、投資人資格分級或地區限制流程。
- 尚未有贖回申請狀態機，例如 requested、approved、burned、settled、rejected。
- 尚未有教師 dashboard 來查看多位學生任務完成度與小測驗結果。
- 尚未有 Tokenomics Canvas、Use Case Canvas、Smart Contract Role Map 的可填寫頁。
- 尚未支援多資產教材，例如房地產、債券、碳權、應收帳款。
- 事件紀錄目前保存的是建立當下的文字，尚未完全改成事件 key + params 的多語言事件系統。

## 建議優先實現

1. **Sepolia onchain integration**
   - 先部署教學合約，前端改成可讀取合約 reserve、supply、proofHash。
   - 老師端操作時由 MetaMask 簽名送出交易，交易成功後顯示 tx hash 與 Etherscan link。

2. **Contract hardening**
   - 將合約改成 OpenZeppelin ERC-20 + AccessControl + Pausable。
   - 補上 mint reserve cap、whitelist transfer、freeze、burn redemption 的測試。

3. **Proof document workflow**
   - 新增文件摘要表單，產生 canonical payload hash。
   - 加入 IPFS / Arweave URI 欄位，但完整 KYC 與保管文件仍留在鏈下。

4. **Redemption state machine**
   - 把 burn redemption 從單一步驟升級成申請、審核、burn、鏈下交割、完成紀錄。
   - 讓學生看懂鏈上 burn 不等於實體黃金已交割。

5. **Instructor reporting**
   - 增加教師用學習報告匯出：任務完成度、小測驗答案、proof 操作紀錄。
   - 可匯出 JSON 或 PDF，方便期末展示與評分。

6. **Canvas modules**
   - 做 Tokenomics Canvas、Use Case Canvas、Role Map 填寫頁。
   - 讓 advanced learner 不只操作 demo，也能設計另一個 RWA 案例。

7. **Multi-asset Academy**
   - 把黃金案例抽象成資產模板。
   - 加入房地產、債券、碳權、應收帳款，讓系統從單一 PoC 擴展成 RWA Academy。
