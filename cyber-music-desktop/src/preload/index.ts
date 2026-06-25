import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  readMusicFiles: (folderPath: string) => ipcRenderer.invoke('fs:readMusicFiles', folderPath),
  getMetadata: (filePath: string) => ipcRenderer.invoke('fs:getMetadata', filePath),
  getCover: (filePath: string) => ipcRenderer.invoke('fs:getCover', filePath),
  getArtistImage: (artistName: string) => ipcRenderer.invoke('api:getArtistImage', artistName),
  getArtistCache: () => ipcRenderer.invoke('api:getArtistCache')
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
