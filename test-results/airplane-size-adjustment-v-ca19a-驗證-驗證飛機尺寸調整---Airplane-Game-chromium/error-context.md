# Page snapshot

```yaml
- alert
- dialog "Server Error":
  - navigation:
    - button "previous" [disabled]:
      - img "previous"
    - button "next" [disabled]:
      - img "next"
    - text: 1 of 1 unhandled error
  - heading "Server Error" [level=1]
  - paragraph: "Error: Cannot find module 'C:\\Users\\Administrator\\Desktop\\EduCreate\\.next\\server\\middleware-manifest.json' Require stack: - C:\\Users\\Administrator\\Desktop\\EduCreate\\node_modules\\next\\dist\\server\\next-server.js - C:\\Users\\Administrator\\Desktop\\EduCreate\\node_modules\\next\\dist\\server\\dev\\next-dev-server.js - C:\\Users\\Administrator\\Desktop\\EduCreate\\node_modules\\next\\dist\\server\\next.js - C:\\Users\\Administrator\\Desktop\\EduCreate\\node_modules\\next\\dist\\server\\lib\\start-server.js"
  - text: This error happened while generating the page. Any console logs will be displayed in the terminal window.
  - heading "Call Stack" [level=2]
  - heading "Module._resolveFilename" [level=3]
  - text: node:internal/modules/cjs/loader (1134:15)
  - heading "<unknown>" [level=3]
  - text: file:///C:/Users/Administrator/Desktop/EduCreate/node_modules/next/dist/server/require-hook.js (54:36)
  - heading "Module._load" [level=3]
  - text: node:internal/modules/cjs/loader (975:27)
  - heading "Module.require" [level=3]
  - text: node:internal/modules/cjs/loader (1225:19)
  - heading "mod.require" [level=3]
  - text: file:///C:/Users/Administrator/Desktop/EduCreate/node_modules/next/dist/server/require-hook.js (64:28)
  - heading "require" [level=3]
  - text: node:internal/modules/helpers (177:18)
  - heading "DevServer.getMiddlewareManifest" [level=3]
  - text: file:///C:/Users/Administrator/Desktop/EduCreate/node_modules/next/dist/server/next-server.js (900:26)
  - heading "DevServer.getEdgeFunctionsPages" [level=3]
  - text: file:///C:/Users/Administrator/Desktop/EduCreate/node_modules/next/dist/server/next-server.js (916:31)
  - heading "NextNodeServer.handleCatchallRenderRequest" [level=3]
  - text: file:///C:/Users/Administrator/Desktop/EduCreate/node_modules/next/dist/server/next-server.js (232:49)
  - heading "async DevServer.handleRequestImpl" [level=3]
  - text: file:///C:/Users/Administrator/Desktop/EduCreate/node_modules/next/dist/server/base-server.js (751:17)
```