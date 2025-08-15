import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

// Simple static file server for EduCreate-Test-Videos/reports via Next API route
// Security notes:
// - Read-only
// - Restrict to reports directory
// - Prevent path traversal

const EDU_ROOT = path.join(process.cwd(), 'EduCreate-Test-Videos')
const REPORTS_ROOT = path.join(EDU_ROOT, 'reports')

const mime = (p: string) => {
  const ext = p.toLowerCase().split('.').pop() || ''
  switch (ext) {
    case 'html': return 'text/html; charset=utf-8'
    case 'json': return 'application/json; charset=utf-8'
    case 'csv': return 'text/csv; charset=utf-8'
    case 'webm': return 'video/webm'
    case 'zip': return 'application/zip'
    case 'png': return 'image/png'
    case 'jpg': case 'jpeg': return 'image/jpeg'
    default: return 'application/octet-stream'
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const segs = Array.isArray(req.query.path) ? req.query.path : (req.query.path ? [String(req.query.path)] : [])
    const rel = segs.join('/')

    // First try within REPORTS_ROOT
    const abs = path.normalize(path.join(REPORTS_ROOT, rel))
    let targetPath = abs
    let isInReports = abs.startsWith(REPORTS_ROOT)

    // If not in reports or doesn't exist, try EduCreate-Test-Videos root
    if (!isInReports || !fs.existsSync(abs)) {
      const altPath = path.normalize(path.join(EDU_ROOT, rel))
      if (altPath.startsWith(EDU_ROOT) && fs.existsSync(altPath)) {
        targetPath = altPath
        isInReports = false
      }
    }

    // Security check: must be within allowed roots
    if (!targetPath.startsWith(REPORTS_ROOT) && !targetPath.startsWith(EDU_ROOT)) {
      res.status(400).json({ error: 'invalid path' })
      return
    }

    // Directory listing for base /_reports
    if (!rel || rel === '/') {
      const items = fs.readdirSync(REPORTS_ROOT, { withFileTypes: true })
        .map(e => ({ name: e.name, type: e.isDirectory() ? 'dir' : 'file' }))
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.status(200).send(JSON.stringify({ root: '/_reports', items }))
      return
    }

    if (!fs.existsSync(targetPath)) {
      res.status(404).json({ error: 'not found' })
      return
    }

    const stat = fs.statSync(targetPath)
    if (stat.isDirectory()) {
      // Serve index.html if exists, else JSON listing
      const indexHtml = path.join(targetPath, 'index.html')
      if (fs.existsSync(indexHtml)) {
        // Fix absolute-ish links inside index.html to work under /_reports
        let html = fs.readFileSync(indexHtml, 'utf8')
        // Normalize links for HTTP under /_reports
        html = html
          // Any link pointing (absolute or via ../) to EduCreate-Test-Videos → map to /_reports/
          .replace(/href=['\"][^'\"]*EduCreate-Test-Videos\//g, "href='/_reports/")
          // Home page relative links like 'daily/...', 'dashboard/...'
          .replace(/href=['\"]daily\//g, "href='/_reports/daily/")
          .replace(/href=['\"]dashboard\//g, "href='/_reports/dashboard/")
          // Relative up-one links to 'current/...'
          .replace(/href=['\"]\.\.\/current\//g, "href='/_reports/current/")
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.status(200).send(html)
      } else {
        const items = fs.readdirSync(targetPath, { withFileTypes: true })
          .map(e => ({ name: e.name, type: e.isDirectory() ? 'dir' : 'file' }))
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.status(200).send(JSON.stringify({ path: '/_reports/' + rel, items }))
      }
      return
    }

    // Serve the file
    res.setHeader('Content-Type', mime(targetPath))
    res.status(200).send(fs.readFileSync(targetPath))
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'internal error' })
  }
}

