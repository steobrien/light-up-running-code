import * as vscode from "vscode"
import * as net from "net"

let timeout: NodeJS.Timer | undefined = undefined

type PathHits = { [line: string]: number }
type Hits = { [path: string]: PathHits }
let hits: Hits = {}

const resetHits = () => {
  hits = {}
}

const addHit = (string: string) => {
  const [path, line] = string.split(" ")
  hits[path] = hits[path] || {}
  hits[path][line] = hits[path][line] || 0
  hits[path][line]++
}

const createDecorationType = (backgroundColor: string) =>
  vscode.window.createTextEditorDecorationType({
    backgroundColor,
    isWholeLine: true,
  })

const heavy = createDecorationType("#FFFF00FF")
const medium = createDecorationType("#FFFF0099")
const light = createDecorationType("#FFFF0011")
type DecorationType = "heavy" | "medium" | "light"

let activeEditor = vscode.window.activeTextEditor

const getDecorations = (type: DecorationType, hits: PathHits) => {
  if (!activeEditor) return []
  const { document } = activeEditor
  const typeCounts = { light: 1, medium: 3, heavy: 10 }
  const minimumCount = typeCounts[type]
  const maximumCount =
    Object.values(typeCounts).find((count) => count > minimumCount) || Infinity
  const decorations: vscode.DecorationOptions[] = []
  Object.keys(hits).forEach((lineNumber) => {
    const count = hits[lineNumber]
    if (count >= minimumCount && count < maximumCount) {
      const line = document.lineAt(parseInt(lineNumber))
      decorations.push({
        range: new vscode.Range(line.range.start, line.range.end),
        hoverMessage: `${count} hits`,
      })
    }
  })
  return decorations
}

function updateDecorations() {
  if (!activeEditor) {
    return
  }

  const { document } = activeEditor
  const pathHits = hits[document.uri.path]

  activeEditor.setDecorations(heavy, getDecorations("heavy", pathHits))
  activeEditor.setDecorations(medium, getDecorations("medium", pathHits))
  activeEditor.setDecorations(light, getDecorations("light", pathHits))
}

function triggerUpdateDecorations() {
  if (timeout) {
    clearTimeout(timeout)
    timeout = undefined
  }
  timeout = setTimeout(updateDecorations, 500)
}

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
  let timeout: NodeJS.Timer | undefined = undefined
  if (activeEditor) {
    triggerUpdateDecorations()
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor
      if (editor) {
        triggerUpdateDecorations()
      }
    },
    null,
    context.subscriptions
  )

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations()
      }
    },
    null,
    context.subscriptions
  )
}

net
  .createServer(function (socket: any) {
    // write down socket
    socket.write("Echo server\r\n")
    socket.on("data", (data: any) => {
      const string = data.toString()
      if (string.includes("RESET")) {
        resetHits()
      } else {
        addHit(string)
        updateDecorations()
      }
    })
    socket.pipe(socket)
  })
  .listen(8124, "127.0.0.1")
