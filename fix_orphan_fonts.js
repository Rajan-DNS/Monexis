/**
 * fix_orphan_fonts.js
 *
 * Finds and fixes orphaned "fontFamily: Poppins.xxx," lines that were
 * accidentally placed as top-level StyleSheet keys (after a closing },)
 * instead of inside the style object they belong to.
 *
 * Strategy:
 *  - When a standalone fontFamily line is found AFTER a line ending with },
 *    → move the fontFamily INTO that preceding style object (before its closing })
 *  - When a standalone fontFamily line is found AFTER a JSX line (ends with }}
 *    or other non-stylesheet contexts) → just delete it (it has no place there)
 */

const fs = require('fs');
const path = require('path');

const SRC = '/Users/dnslink/Desktop/react_native_project/Apiimpay/ApiimpayAPP/src';

function findFiles(dir) {
  const files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.name === 'node_modules') continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...findFiles(full));
    else if (item.isFile() && /\.(tsx|ts)$/.test(item.name) && !item.name.endsWith('.d.ts')) files.push(full);
  }
  return files;
}

function fixFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split('\n');

  // We'll do multiple passes until stable (orphans can stack)
  let current = [...lines];
  let changed = false;

  for (let pass = 0; pass < 5; pass++) {
    let passChanged = false;
    const next = [];
    let i = 0;

    while (i < current.length) {
      const line = current[i];

      // Is this a standalone fontFamily line?
      const fontMatch = line.match(/^(\s*)fontFamily:\s*(Poppins\.\w+),?\s*$/);

      if (fontMatch) {
        const indent = fontMatch[1];
        const variant = fontMatch[2];

        // Find the previous non-blank line index (in `next` output so far)
        let prevIdx = next.length - 1;
        while (prevIdx >= 0 && next[prevIdx].trim() === '') prevIdx--;
        const prevLine = prevIdx >= 0 ? next[prevIdx] : '';
        const trimmedPrev = prevLine.trim();

        // Case A: previous line ends with }  or },  or };
        // This is a StyleSheet orphan — move fontFamily into the preceding block.
        if (
          trimmedPrev.endsWith('},') ||
          trimmedPrev.endsWith('};') ||
          (trimmedPrev === '}')
        ) {
          // Scan back in `next` to find the matching opening { for this }
          let depth = 0;
          let blockEndIdx = prevIdx; // the line with the closing }
          let blockStartIdx = -1;

          const closingLine = next[blockEndIdx];
          const closingBracePos = closingLine.lastIndexOf('}');

          for (let j = blockEndIdx; j >= 0; j--) {
            const l = next[j];
            const startK = j === blockEndIdx ? closingBracePos : l.length - 1;
            for (let k = startK; k >= 0; k--) {
              if (l[k] === '}') depth++;
              if (l[k] === '{') {
                depth--;
                if (depth === 0) { blockStartIdx = j; break; }
              }
            }
            if (blockStartIdx !== -1) break;
          }

          // Check if fontFamily already exists in that block
          const blockText = next.slice(
            blockStartIdx !== -1 ? blockStartIdx : 0,
            blockEndIdx + 1
          ).join('\n');
          if (/\bfontFamily\b/.test(blockText)) {
            // Already there — just drop the orphan
            i++;
            passChanged = true;
            changed = true;
            continue;
          }

          // Insert fontFamily BEFORE the closing brace line
          if (trimmedPrev === '},' || trimmedPrev === '};' || trimmedPrev === '}') {
            // closing brace is on its own line → insert a new line before it
            next.splice(blockEndIdx, 0, `${indent}fontFamily: ${variant},`);
          } else {
            // closing brace is at the end of an inline object like:
            // someStyle: { color: 'red' },
            // → inject before the }
            const before = closingLine.slice(0, closingBracePos);
            const after  = closingLine.slice(closingBracePos);
            next[blockEndIdx] = `${before} fontFamily: ${variant},${after}`;
          }

          // Drop the orphan line (don't push it)
          i++;
          passChanged = true;
          changed = true;
          continue;
        }

        // Case B: previous line ends with }} (JSX inline style) or is a JSX element
        // Just delete the orphan.
        if (trimmedPrev.endsWith('}}') || trimmedPrev.endsWith('>') || trimmedPrev.endsWith(';')) {
          i++;
          passChanged = true;
          changed = true;
          continue;
        }

        // Case C: unknown context — delete to be safe
        if (trimmedPrev.endsWith('}')) {
          i++;
          passChanged = true;
          changed = true;
          continue;
        }
      }

      next.push(line);
      i++;
    }

    current = next;
    if (!passChanged) break;
  }

  if (!changed) return false;

  const result = current.join('\n');
  if (result === original) return false;

  fs.writeFileSync(filePath, result, 'utf8');
  return true;
}

// ─── Main ───────────────────────────────────────────────────────────────────
const files = findFiles(SRC);
let fixed = 0;
for (const f of files) {
  try {
    if (fixFile(f)) {
      console.log('  ✅ Fixed: ' + path.relative(SRC, f));
      fixed++;
    }
  } catch (e) {
    console.error('  ❌ Error in ' + path.relative(SRC, f) + ': ' + e.message);
  }
}
console.log('\n✨ Done — fixed orphan fontFamily in ' + fixed + ' files.\n');
