import * as vscode from "vscode"
import * as net from "net"

type PathHits = { [line: string]: number }
type Hits = { [path: string]: PathHits }
type DecorationType = "heavy" | "medium" | "light"

const PORT = 8000
const HOST = "localhost"
const counts = { light: 1, medium: 3, heavy: 10 }
let timeout: NodeJS.Timer | undefined = undefined
let hits: Hits = {}
let activeEditor = vscode.window.activeTextEditor

const resetHits = () => {
  hits = {}
}

const addHit = (string: string) => {
  const [path, line] = string.split(" ").map((s) => s.trim())
  hits[path] = hits[path] || {}
  hits[path][line] = hits[path][line] || 0
  hits[path][line]++
}

const createDecorationType = (backgroundColor: string) =>
  vscode.window.createTextEditorDecorationType({
    backgroundColor,
    isWholeLine: true,
  })
const heavy = createDecorationType("#FFFFCC30")
const medium = createDecorationType("#FFFFCC20")
const light = createDecorationType("#FFFFCC10")

const getDecorations = (type: DecorationType, hits: PathHits) => {
  if (!activeEditor) return []
  const { document } = activeEditor
  const minCount = counts[type]
  const maxCount = Object.values(counts).find((c) => c > minCount) || Infinity
  const decorations: vscode.DecorationOptions[] = []
  Object.keys(hits).forEach((lineNumber) => {
    const count = hits[lineNumber]
    if (count >= minCount && count < maxCount) {
      const line = document.lineAt(parseInt(lineNumber))
      decorations.push({
        range: new vscode.Range(line.range.start, line.range.end),
        hoverMessage: `ran ${count} time${count === 1 ? "" : "s"}`,
      })
    }
  })
  return decorations
}

const updateDecorations = () => {
  if (!activeEditor) return
  const pathHits = hits[activeEditor.document.uri.path]
  activeEditor.setDecorations(heavy, getDecorations("heavy", pathHits))
  activeEditor.setDecorations(medium, getDecorations("medium", pathHits))
  activeEditor.setDecorations(light, getDecorations("light", pathHits))
}

const triggerUpdateDecorations = () => {
  if (!activeEditor) return
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(updateDecorations, 500)
}

export const activate = (context: vscode.ExtensionContext) => {
  triggerUpdateDecorations()

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor
      triggerUpdateDecorations()
    },
    null,
    context.subscriptions
  )
}

net
  .createServer((socket) => {
    socket.on("data", (buffer) => {
      const data = buffer.toString()
      if (data.includes("RESET")) {
        resetHits()
      } else {
        addHit(data)
        updateDecorations()
      }
    })
    socket.pipe(socket)
  })
  .listen(PORT, HOST)
