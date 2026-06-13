/**
 * App.tsx
 * 放置路徑：src/App.tsx
 *
 * 唯一職責：
 *  1. 包住 ThemeProvider
 *  2. 跑 useProjectTree() 取得所有狀態
 *  3. 根據 theme 決定渲染 HackerTheme 或 DefaultTheme
 *     （狀態在這層，主題切換不會 reset 資料）
 */

import './App.css'
import { ThemeProvider, useTheme } from './ThemeContext'
import { useProjectTree, isFolderPickerSupported } from './hooks/useProjectTree'
import { HackerTheme } from './HackerTheme'
import { DefaultTheme } from './DefaultTheme'

function AppInner() {
  const { theme } = useTheme()
  const folderSupported = isFolderPickerSupported()

  const {
    rootNode,
    asciiResult,
    isLoading,
    error,
    inputSource,
    mode,
    enableTruncation,
    setMode,
    setEnableTruncation,
    handleFolderPick,
    handleZipUpload,
    handleToggle,
    handleClear,
  } = useProjectTree()

  const sharedProps = {
    rootNode,
    asciiResult,
    isLoading,
    error,
    inputSource,
    mode,
    enableTruncation,
    setMode,
    setEnableTruncation,
    handleFolderPick,
    handleZipUpload,
    handleToggle,
    handleClear,
    folderSupported,
  }

  return theme === 'hacker'
    ? <HackerTheme {...sharedProps} />
    : <DefaultTheme {...sharedProps} />
}

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}

export default App
