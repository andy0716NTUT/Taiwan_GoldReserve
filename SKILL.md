---
name: rwa-frontend-wallet-onchain
description: Use when a student already has a deployed or locally runnable RWA/frontend website but it cannot connect MetaMask or write property/asset hashes onchain yet. Inspect the project structure and UI/data flow first, infer the safest integration point and safe hash fields from the student's project, ask only for the Sepolia contract address unless blocked, then add a beginner-safe frontend-only MetaMask onchain flow after explicit edit approval.
---

# RWA Frontend Wallet Onchain

## Purpose

Help a student connect an existing RWA frontend to Sepolia from the browser:

```text
existing frontend UI -> inferred onchain action -> connect MetaMask -> create safe asset hash -> send Sepolia transaction
```

Assume the student already has a frontend website locally or deployed. Do not teach Remix. Do not deploy a contract. Do not ask for private keys. The goal is to make the frontend able to connect a wallet and register a safe hash on an existing Sepolia contract.

This skill should behave like a technical consultant: inspect the student's project, infer the best integration plan from the existing architecture, ask only for the contract address unless something is genuinely ambiguous, then request approval before edits.

## Safety Rules

- Inspect before editing. Do not assume framework, routes, page names, roles, or data shape.
- Do not modify files before the user approves the exact edit plan.
- Do not edit files outside the current project workspace.
- Do not delete files unless the user explicitly confirms exact paths.
- Do not ask for private keys, seed phrases, API keys, or wallet secrets.
- Do not send transactions yourself; the user must confirm in MetaMask.
- Do not add backend private-key signing, custodial wallets, or paid services.
- Do not put full address, owner name, phone/email, identity number, title deed, lease files, or personal data directly onchain.
- Do not expand implementation into NFT, ERC-20, token sales, revenue sharing, custody, KYC/AML, Reg D/Reg S enforcement, or production compliance unless the user explicitly changes scope.
- Do not use Remix as a required step. Verification should use the frontend, MetaMask, transaction hash, Etherscan, or existing read functions.

## Default Contract

Ask the user which Sepolia contract address to use. If they do not have one, offer this teacher default:

```text
Network: Sepolia
Chain ID: 11155111
Contract: 0x4081C59E473798Bd72282CD954976Da64DDfB584
```

Expected contract interface:

```solidity
registerPropertyHash(string propertyId, bytes32 propertyHash)
getPropertyHash(string propertyId)
verifyPropertyHash(string propertyId, bytes32 propertyHash)
```

If the user provides a different contract address, confirm whether it uses the same interface. If the ABI differs, stop and ask for the ABI or inspect the project if the ABI already exists.

## Required Workflow

### 1. Inspect The Project First

Use read-only commands first. Prefer `rg --files`, `package.json`, framework directories, existing docs, and current component/page files.

Find:

- frontend framework and package manager
- app entry points and route structure
- where the asset/property/RWA form, list, detail page, or approval UI lives
- current user flow: direct submit, dashboard action, admin/reviewer approval, detail page button, publish/deploy button, or another project-specific flow
- where asset data is stored: React state, localStorage, API, backend, database, mock data, etc.
- whether existing Web3 tools are present: `ethers`, `viem`, `wagmi`, `web3`, wallet connector code, ABI files
- whether there is already a deployed frontend URL or Vercel setup
- how to run and test locally

Do not start implementation during this step.

### 2. Provide Architecture And RWA Readiness Summary

Report briefly:

- framework and project structure
- likely files/components involved
- current asset creation/submission/publish flow
- inferred best frontend action for onchain registration
- inferred safe fields that can be hashed
- missing pieces: wallet connect, hash helper, contract write helper, UI state, verification display

Also include a short RWA teaching-readiness note using these five categories. Keep this as analysis guidance, not automatic implementation scope:

1. **Compliance design: Reg D / Reg S / qualified investor**
   - Identify whether the project has investor role, eligibility labels, region restrictions, or accreditation UI.
   - Do not implement legal compliance or claim the project is compliant.
   - If absent, say it is a teaching gap and should remain demo-only.
2. **Technical choices: blockchain platform and smart contract framework**
   - Identify current Web3 stack, target Sepolia/EVM, wallet flow, and whether ABI/config exists.
   - Prefer existing project tools; otherwise use frontend `window.ethereum`.
3. **Reserve proof: onchain/offchain bridge**
   - Identify whether the project has audit, proof, document status, or witness fields.
   - For this Skill, register only a hash/proof pointer, not private documents.
4. **Mint/Burn flow and limits**
   - Identify whether the UI mentions mint, burn, issuance, redemption, or supply.
   - Do not implement token mint/burn unless the user's contract and scope explicitly support it.
   - For this Skill, the normal action is hash registration, not token issuance.
5. **Ecosystem and liquidity strategy**
   - Identify whether the project has marketplace, investor dashboard, secondary trading, or liquidity wording.
   - Treat this as product strategy context only; do not add trading/liquidity features.

If the asset/property flow is unclear, stop and ask where the asset data lives. Otherwise infer the integration point and continue.

### 3. Ask Only The Required Contract Question

Ask for the Sepolia contract address:

```text
請提供要寫入的 Sepolia 合約地址；如果沒有，我會使用老師預設合約 0x4081C59E473798Bd72282CD954976Da64DDfB584。
```

Do not ask the user which fields should be hashed. Infer safe fields from the project and explain the inferred whitelist in the edit plan.

Do not ask the user to choose the UI action if the project clearly has one natural onchain point. Infer it from the architecture and state it in the edit plan. Ask only if multiple choices are equally plausible and choosing the wrong one would alter the user's workflow.

After the contract address is known, explain:

```text
The frontend will not upload the full asset record to blockchain.
It will hash selected safe fields, then send propertyId and propertyHash to Sepolia.
MetaMask signs the transaction; the app never sees the private key.
```

### 4. Propose An Edit Plan And Wait

Before modifying files, list:

- files to edit
- files to add
- inferred UI action to connect to MetaMask/onchain registration
- inferred safe fields to hash and excluded sensitive fields
- behavior changes
- whether any package install is needed
- local commands/tests to run
- how the user will demo it

Ask for explicit approval and wait.

### 5. Implementation Guidance

Fit the existing project style. Do not force the teacher demo architecture into the student project.

Preferred implementation:

- Add a small canonical hash helper near existing `utils`, `lib`, `helpers`, or domain code.
- Add a contract/wallet helper near existing Web3 code, or create the smallest project-native helper if none exists.
- Add one onchain action at the inferred and approved UI location.
- On click: connect MetaMask, switch to Sepolia, create hash, send transaction, then show result.
- Display at least: `propertyId`, `propertyHash`, `txHash`, chain ID, and contract address.
- Keep pending/error/success states visible in the student's existing UI style.

Use existing Web3 libraries if already installed. If none exist, prefer `window.ethereum.request` to avoid unnecessary dependencies.

Expected frontend behavior:

```text
User opens existing frontend
-> user creates/selects/publishes asset through the existing UI
-> user clicks the inferred onchain action
-> MetaMask opens
-> user confirms Sepolia transaction
-> frontend displays txHash and hash details
```

## Safe Hash Field Policy

Infer a whitelist from the student's project. Do not ask the user to manually choose fields unless the project has no safe fields.

Good candidates:

- random/internal `propertyId` or `assetId`
- asset/property type
- valuation or target amount
- rent/income numbers if demo-safe
- document status labels, not files
- audit/proof status labels, not documents
- non-sensitive public status fields
- timestamp or version if already part of the project's public workflow

Avoid:

- full address
- owner real name
- phone/email
- ID/passport/tax number
- title deed numbers or files
- lease files or tenant personal data
- free-text notes that may contain identities
- exact legal/compliance claims unless they are demo labels only

If the project only has sensitive real-world data, stop and ask the user to create demo-safe fields before implementing.

## Beginner MetaMask Pattern

Use this pattern only as guidance; adapt to existing `ethers`, `viem`, or `wagmi` if present.

```js
await ethereum.request({
  method: "wallet_switchEthereumChain",
  params: [{ chainId: "0xaa36a7" }]
});

const [from] = await ethereum.request({ method: "eth_requestAccounts" });

const txHash = await ethereum.request({
  method: "eth_sendTransaction",
  params: [{ from, to: registryAddress, data }]
});
```

The transaction `data` must encode:

```text
registerPropertyHash(string propertyId, bytes32 propertyHash)
```

If encoding manually, keep the encoder small and tested. If the project already has `ethers` or `viem`, use that library's ABI encoder/write contract pattern.

## Local Demo Requirements

Before telling the user to update Vercel or another deployed frontend, verify locally:

- app starts locally
- target UI action is visible
- MetaMask connection opens
- wallet switches to Sepolia or asks the user to switch
- transaction prompt shows the selected contract address
- app displays tx hash after confirmation
- app does not ask for private keys
- full sensitive data is not sent onchain
- RWA teaching-readiness gaps are clearly described as demo limitations, not as completed compliance features

If local works and the user wants deployment help, follow the project's existing deployment flow. For Vercel, prefer the existing Vercel project/CLI setup and do not create a new project unless asked.

## Verification Without Remix

Do not require Remix. Use one of these:

- frontend displays the returned `txHash`
- transaction can be opened on Sepolia Etherscan
- existing frontend read/verify button calls `getPropertyHash(propertyId)` or `verifyPropertyHash(propertyId, propertyHash)`
- if the project has a script or test, use that read method

Teach the student to verify with:

```text
propertyId used by the frontend
propertyHash generated by the frontend
txHash returned by MetaMask
contract address
chain ID 11155111
```

## Stop Conditions

Stop and ask before continuing if:

- you cannot find the asset/property data flow
- contract address or ABI is unclear
- no safe non-sensitive fields exist for hashing
- the user asks for backend private-key automation
- implementation requires editing outside the workspace
- package installation is required but not approved
- the project contains real personal/legal property data that would be exposed by the proposed flow
