# ArchLens Web — 產品層 AI 指引

本檔是 **ArchLens 系列** 的一員。系列層指引（mission、痛點↔產品對照表、共用 schema、scope 慣例）在上層
[`../AGENTS.md`](../AGENTS.md)，AI session 會自動一併繼承。**先讀那份。**
（本 repo 已遷移至系列下的正式位置 `D:\AIWork\ArchLens_Series\ArchLens-Web\`。）

## 本產品負責（`[product:web]`，stage: understand）

掃描專案資料夾 / zip，產生 ASCII 目錄樹與結構總覽，作為「一眼看懂結構」與「餵給 AI 的 context」的起點。
是系列裡 `tree` 的**產生者**——其他產品消費它的輸出。UI 已有 `ThemeContext` / `DefaultTheme` / `HackerTheme`，是系列共用主題包的抽取基礎。

## 不屬於本產品的需求 → 請指向姊妹產品

- import / 依賴 / 耦合 / 循環依賴 → **dependency**（`ArchLens-DependencyTeller/`）。
- 版本之間結構怎麼變了 → **diff**（`ArchLens-DiffTeller/`）。
- 文件與程式碼對不上 → **docsgap**（`ArchLens-DocsGapTeller/`）。

## 資料契約

本產品是 `tree` 的來源。匯出時包進系列共用信封 `{ "archlens": "1.0", "kind": "tree", "payload": { "nodes": [{ "path", "type" }] } }`，
讓輸出可直接被 diff / dependency / docsgap 消費（見系列層 AGENTS.md 的 Layer B）。
