/**
 * scanner.ts
 * 放置路徑：src/services/scanner.ts
 */

import JSZip from 'jszip'
import type { TreeNodeData } from '../types'
import {
  DEFAULT_IGNORE_PATTERNS,
  parseGitignoreContent,
  shouldIgnore,
} from './ignoreRules'

// ── File System Access API 型別補充
// entries() 回傳 AsyncIterable，需要 DOM.AsyncIterable lib 或手動宣告
declare global {
  interface FileSystemDirectoryHandle {
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>
  }
}

// ─────────────────────────────────────────────
// 資料夾掃描（File System Access API）
// ─────────────────────────────────────────────

export async function scanDirectory(
  dirHandle: FileSystemDirectoryHandle,
  ignorePatterns: string[] = [...DEFAULT_IGNORE_PATTERNS],
  relativePath: string = ''
): Promise<TreeNodeData> {
  // 讀取當前目錄的 .gitignore（DD-021 動態局部疊加）
  const localPatterns = [...ignorePatterns]
  try {
    const gitignoreHandle = await dirHandle.getFileHandle('.gitignore')
    const gitignoreFile = await gitignoreHandle.getFile()
    const content = await gitignoreFile.text()
    localPatterns.push(...parseGitignoreContent(content))
  } catch {
    // .gitignore 不存在，繼續
  }

  const node: TreeNodeData = {
    name: dirHandle.name,
    is_dir: true,
    relative_path: relativePath,
    size: 0,
    is_enabled: true,
    children: [],
  }

  for await (const [name, handle] of dirHandle.entries()) {
    if (shouldIgnore(name, localPatterns)) continue

    const childPath = relativePath === '' ? name : `${relativePath}/${name}`

    if (handle.kind === 'directory') {
      const childNode = await scanDirectory(
        handle as FileSystemDirectoryHandle,
        localPatterns,
        childPath
      )
      node.children.push(childNode)
    } else {
      let size = 0
      try {
        const file = await (handle as FileSystemFileHandle).getFile()
        size = file.size
      } catch {
        // 無法讀取大小
      }
      node.children.push({
        name,
        is_dir: false,
        relative_path: childPath,
        size,
        is_enabled: true,
        children: [],
      })
    }
  }

  return node
}

// ─────────────────────────────────────────────
// ZIP 解析（JSZip）
// ─────────────────────────────────────────────

export async function scanZip(
  file: File,
  ignorePatterns: string[] = [...DEFAULT_IGNORE_PATTERNS]
): Promise<TreeNodeData> {
  const zip = await JSZip.loadAsync(file)
  const allPaths = Object.keys(zip.files).sort()
  const rootPrefix = detectRootPrefix(allPaths)

  const rootName = rootPrefix
    ? rootPrefix.replace(/\/$/, '')
    : file.name.replace(/\.zip$/i, '')

  const root: TreeNodeData = {
    name: rootName,
    is_dir: true,
    relative_path: '',
    size: 0,
    is_enabled: true,
    children: [],
  }

  const nodesMap = new Map<string, TreeNodeData>()
  nodesMap.set('', root)

  for (const path of allPaths) {
    const strippedPath = rootPrefix ? path.slice(rootPrefix.length) : path
    if (!strippedPath) continue

    const parts = strippedPath.replace(/\/$/, '').split('/')
    if (parts.length === 0 || (parts.length === 1 && parts[0] === '')) continue
    if (parts.some(p => shouldIgnore(p, ignorePatterns))) continue

    let currentPath = ''
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const parentPath = currentPath
      currentPath = currentPath === '' ? part : `${currentPath}/${part}`

      if (nodesMap.has(currentPath)) continue

      const isLastPart = i === parts.length - 1
      const isDir = isLastPart
        ? (zip.files[rootPrefix + currentPath + '/'] !== undefined ||
           (zip.files[rootPrefix + currentPath]?.dir ?? false))
        : true

      let size = 0
      if (!isDir && isLastPart) {
        const zipFile = zip.files[rootPrefix + currentPath]
        if (zipFile && !zipFile.dir) {
          type ZipInternal = { _data?: { uncompressedSize?: number } }
          size = (zipFile as unknown as ZipInternal)._data?.uncompressedSize ?? 0
        }
      }

      const newNode: TreeNodeData = {
        name: part,
        is_dir: isDir,
        relative_path: currentPath,
        size,
        is_enabled: true,
        children: [],
      }

      nodesMap.set(currentPath, newNode)
      nodesMap.get(parentPath)?.children.push(newNode)
    }
  }

  return root
}

function detectRootPrefix(paths: string[]): string {
  if (paths.length === 0) return ''
  const topLevelDirs = new Set<string>()
  for (const p of paths) {
    const slash = p.indexOf('/')
    if (slash !== -1) topLevelDirs.add(p.slice(0, slash + 1))
  }
  if (topLevelDirs.size === 1) {
    const prefix = [...topLevelDirs][0]
    if (paths.every(p => p.startsWith(prefix) || p === prefix.slice(0, -1))) {
      return prefix
    }
  }
  return ''
}
