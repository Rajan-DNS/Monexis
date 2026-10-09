/**
 * apply_poppins_font.js
 * Automatically adds fontFamily: Poppins.xxx to every StyleSheet style object
 * that has fontSize but lacks fontFamily, across the entire src/ directory.
 *
 * fontWeight mapping:
 *   '400' / 'normal'   → Poppins.regular
 *   '500'              → Poppins.medium
 *   '600'              → Poppins.semiBold
 *   '700' / 'bold'     → Poppins.bold
 *   '800' / '900'      → Poppins.extraBold
 *   (none)             → Poppins.regular
 */

const fs   = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

// ─── helpers ────────────────────────────────────────────────────────────────

function findFiles(dir) {
  const files = [];
  try {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (item.name === 'node_modules') continue;
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...findFiles(full));
      } else if (item.isFile() && /\.(tsx|ts)$/.test(item.name) && !item.name.endsWith('.d.ts')) {
        files.push(full);
      }
    }
  } catch (_) {}
  return files;
}

function poppinsVariant(fontWeight) {
  if (!fontWeight) return 'Poppins.regular';
  const w = fontWeight.replace(/['"]/g, '').trim();
  if (w === '400' || w === 'normal') return 'Poppins.regular';
  if (w === '500')                   return 'Poppins.medium';
  if (w === '600')                   return 'Poppins.semiBold';
  if (w === '700' || w === 'bold')   return 'Poppins.bold';
  if (w === '800' || w === '900')    return 'Poppins.extraBold';
  return 'Poppins.regular';
}

// ─── core transformation ────────────────────────────────────────────────────

/**
 * Given the full file content, inserts fontFamily after every fontSize
 * that is inside a style block that has no fontFamily yet.
 * Returns { content, modified }.
 */
function addFontFamily(content) {
  const lines   = content.split('\n');
  const result  = [...lines];
  let modified  = false;
  let insertOffset = 0;   // how many lines we've inserted so far

  for (let i = 0; i < lines.length; i++) {
    if (!/\bfontSize\s*:/.test(lines[i])) continue;

    // ── 1. Find the opening brace of the enclosing style block (scan back) ──
    let depth      = 0;
    let blockStart = -1;

    scan_back:
    for (let j = i; j >= 0; j--) {
      const l = lines[j];
      const end = j === i ? l.length - 1 : l.length - 1;
      for (let k = end; k >= 0; k--) {
        if (l[k] === '}') { depth++; }
        if (l[k] === '{') {
          if (depth === 0) { blockStart = j; break scan_back; }
          depth--;
        }
      }
    }
    if (blockStart === -1) continue;

    // ── 2. Find the matching closing brace (scan forward) ───────────────────
    depth = 0;
    let blockEnd  = -1;
    let openSeen  = false;

    scan_fwd:
    for (let j = blockStart; j < lines.length; j++) {
      const l = lines[j];
      for (let k = 0; k < l.length; k++) {
        if (l[k] === '{')            { depth++; openSeen = true; }
        if (l[k] === '}' && openSeen) {
          depth--;
          if (depth === 0) { blockEnd = j; break scan_fwd; }
        }
      }
    }
    if (blockEnd === -1) continue;

    // ── 3. Check existing fontFamily in this block ───────────────────────────
    const blockLines   = lines.slice(blockStart, blockEnd + 1);
    const blockContent = blockLines.join('\n');
    if (/\bfontFamily\s*:/.test(blockContent)) continue;

    // ── 4. Determine correct Poppins variant from fontWeight in block ────────
    const wm       = blockContent.match(/\bfontWeight\s*:\s*(['"]?)([^,}\n\r]+)\1/);
    const variant  = poppinsVariant(wm ? wm[2].trim() : null);

    // ── 5. Get indentation of the fontSize line ─────────────────────────────
    const indent = (lines[i].match(/^(\s*)/) || ['', ''])[1];

    // ── 6. Insert fontFamily AFTER the fontSize line in result[] ────────────
    const resultIdx = i + insertOffset;   // account for already-inserted lines
    const curLine   = result[resultIdx];

    // Ensure the fontSize line ends with a comma
    let fixedLine = curLine;
    if (!/,\s*$/.test(curLine.trimEnd())) {
      fixedLine = curLine.replace(/(\bfontSize\s*:\s*[\w.]+)\s*$/, '$1,');
    }
    result[resultIdx] = fixedLine;

    result.splice(resultIdx + 1, 0, `${indent}fontFamily: ${variant},`);
    insertOffset++;
    modified = true;
  }

  return { content: result.join('\n'), modified };
}

// ─── import injection ───────────────────────────────────────────────────────

function ensurePoppinsImport(content, filePath) {
  if (/\bPoppins\b/.test(content)) return content;  // already imported

  const relPath = path
    .relative(path.dirname(filePath), path.join(SRC_DIR, 'theme/typography'))
    .replace(/\\/g, '/');
  const importPath = relPath.startsWith('.') ? relPath : './' + relPath;
  const stmt = `import { Poppins } from '${importPath}';`;

  // Insert after the last import statement
  const importRe = /^import\s[\s\S]+?['"][^'"]+['"]\s*;/gm;
  let last = null;
  let m;
  while ((m = importRe.exec(content)) !== null) last = m;

  if (last) {
    const pos = last.index + last[0].length;
    return content.slice(0, pos) + '\n' + stmt + content.slice(pos);
  }
  return stmt + '\n' + content;
}

// ─── process one file ───────────────────────────────────────────────────────

function processFile(filePath) {
  const orig = fs.readFileSync(filePath, 'utf8');

  if (!orig.includes('StyleSheet.create')) return false;

  const { content: transformed, modified } = addFontFamily(orig);
  if (!modified) return false;

  const final = ensurePoppinsImport(transformed, filePath);

  if (final !== orig) {
    fs.writeFileSync(filePath, final, 'utf8');
    return true;
  }
  return false;
}

// ─── main ───────────────────────────────────────────────────────────────────

const files = findFiles(SRC_DIR);
console.log(`\n🔍  Found ${files.length} TypeScript/TSX files\n`);

let changed = 0;
for (const f of files) {
  try {
    if (processFile(f)) {
      console.log(`  ✅  ${path.relative(SRC_DIR, f)}`);
      changed++;
    }
  } catch (e) {
    console.error(`  ❌  ${path.relative(SRC_DIR, f)} — ${e.message}`);
  }
}

console.log(`\n✨  Done — ${changed}/${files.length} files updated with Poppins font family.\n`);
