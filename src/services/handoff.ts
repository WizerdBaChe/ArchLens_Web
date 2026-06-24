/**
 * handoff.ts
 * 把目前的結構樹「送到 ArchLens Diff 比較」——Phase 3 反孤島的報告 handoff。
 *
 * 機制：把 tree 信封寫進 localStorage，再開 Diff 並帶 ?handoff=tree。
 * 系列產品在正式部署時同源（都在 wizerdbache.github.io），因此共用 localStorage；
 * Diff 載入時讀取並注入到輸入端。本機開發跨 port 不同源時不會共享，Diff 會顯示
 * 「找不到交接資料」並請使用者改用手動匯入（優雅降級）。
 */

import type { TreeNodeData } from '../types'
import { buildTreeEnvelope } from './treeExport'

/** 與 Diff 端共用的 localStorage 鍵（兩邊都改時要一致）。 */
export const HANDOFF_KEY = 'archlens:handoff'

/**
 * Diff 的正式網址。對齊 suite-manifest.json 的 products[id=diff].url；
 * vendor 期暫時內嵌，hub 發佈後可改為讀 manifest。
 */
const DIFF_URL = 'https://wizerdbache.github.io/ArchLens-DiffTeller/'

export interface HandoffPayload {
  /** 要載入到 Diff 的哪一側。Web 匯出的是「目前結構」，預設放右側（新版）。 */
  side: 'left' | 'right'
  from: string
  at: number
  envelope: ReturnType<typeof buildTreeEnvelope>
}

/** 把結構樹交接給 Diff：寫 localStorage + 開新分頁帶 ?handoff=tree。 */
export function sendTreeToDiff(root: TreeNodeData): void {
  const payload: HandoffPayload = {
    side: 'right',
    from: 'web',
    at: Date.now(),
    envelope: buildTreeEnvelope(root),
  }
  try {
    localStorage.setItem(HANDOFF_KEY, JSON.stringify(payload))
  } catch {
    // localStorage 被擋 / 容量不足：仍開 Diff，使用者可改手動匯入下載的 JSON
  }
  const url = new URL(DIFF_URL)
  url.searchParams.set('handoff', 'tree')
  window.open(url.toString(), '_blank', 'noopener')
}
