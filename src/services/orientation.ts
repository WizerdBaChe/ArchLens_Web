/**
 * Orientation — pure structural heuristics for ArchLens Web.
 *
 * Rules:
 * - NO import parsing (web never has file content — boundary with dependency).
 * - Only uses path, name, size, depth from TreeNodeData.
 * - EntryHeuristic is a swappable interface so the baseline can be replaced
 *   without touching the pipeline (per global CLAUDE.md quality guideline).
 */
import type { TreeNodeData } from '../types'

export interface OrientationSummary {
  entryCandidates: string[]
  largestDirs: { path: string; fileCount: number; bytes: number }[]
  deepestPaths: string[]
}

export interface EntryHeuristic {
  (root: TreeNodeData): string[]
}

const ENTRY_NAME_PATTERNS = [
  /^index\.[mc]?[jt]sx?$/i,
  /^main\.[mc]?[jt]sx?$/i,
  /^app\.[mc]?[jt]sx?$/i,
  /^__main__\.py$/i,
  /^main\.py$/i,
  /^cli\.[mc]?[jt]sx?$/i,
]

export const defaultEntryHeuristic: EntryHeuristic = (root) => {
  const candidates: string[] = []
  function dfs(node: TreeNodeData) {
    if (!node.is_enabled) return
    if (!node.is_dir) {
      if (ENTRY_NAME_PATTERNS.some((p) => p.test(node.name))) {
        candidates.push(node.relative_path)
      }
      return
    }
    for (const child of node.children ?? []) {
      dfs(child)
    }
  }
  dfs(root)
  return candidates
}

export function deriveOrientation(
  root: TreeNodeData,
  entryHeuristic: EntryHeuristic = defaultEntryHeuristic,
  topN = 5,
): OrientationSummary {
  const entryCandidates = entryHeuristic(root)

  const dirStats = new Map<string, { path: string; fileCount: number; bytes: number }>()
  const deepFiles: { path: string; depth: number }[] = []

  function countDir(node: TreeNodeData, depth: number): { fileCount: number; bytes: number } {
    if (!node.is_enabled) return { fileCount: 0, bytes: 0 }
    if (!node.is_dir) {
      deepFiles.push({ path: node.relative_path, depth })
      return { fileCount: 1, bytes: node.size }
    }
    let fileCount = 0
    let bytes = 0
    for (const child of node.children ?? []) {
      const sub = countDir(child, depth + 1)
      fileCount += sub.fileCount
      bytes += sub.bytes
    }
    if (node.relative_path && fileCount > 0) {
      dirStats.set(node.relative_path, { path: node.relative_path, fileCount, bytes })
    }
    return { fileCount, bytes }
  }

  countDir(root, 0)

  const largestDirs = [...dirStats.values()]
    .sort((a, b) => b.fileCount - a.fileCount)
    .slice(0, topN)

  const deepestPaths = [...deepFiles]
    .sort((a, b) => b.depth - a.depth)
    .slice(0, topN)
    .map((d) => d.path)

  return { entryCandidates, largestDirs, deepestPaths }
}

/** Builds a comment-prefixed header block safe to prepend to any txt/md/clipboard output. */
export function renderOrientationHeader(s: OrientationSummary): string {
  const lines: string[] = ['# ArchLens — Orientation', '#']

  if (s.entryCandidates.length > 0) {
    lines.push('# Entry points (likely start here):')
    for (const p of s.entryCandidates) lines.push(`#   ${p}`)
    lines.push('#')
  }

  if (s.largestDirs.length > 0) {
    lines.push('# Largest directories:')
    for (const d of s.largestDirs) lines.push(`#   ${d.path}  (${d.fileCount} files)`)
    lines.push('#')
  }

  if (s.deepestPaths.length > 0) {
    lines.push('# Deepest paths:')
    for (const p of s.deepestPaths) lines.push(`#   ${p}`)
    lines.push('#')
  }

  return lines.join('\n')
}
