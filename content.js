(function () {
    'use strict';

    // ── Helpers ──────────────────────────────────────────────────────────────

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function extractBadgeName(anchorEl) {
        const clone = anchorEl.cloneNode(true);
        clone.querySelectorAll('.plapl, .final').forEach(el => el.remove());
        return clone.textContent.trim();
    }

    // ── Data Parsing ─────────────────────────────────────────────────────────

    function parseReportData() {
        const reportBody = document.querySelector('#report-body');
        if (!reportBody) return [];

        const cubs = [];
        let currentCub = null;
        let currentBadge = null;

        for (const li of reportBody.children) {
            if (li.classList.contains('divider')) {
                currentCub = { name: li.textContent.trim(), badges: [] };
                cubs.push(currentCub);
                currentBadge = null;
            } else if (li.classList.contains('forward')) {
                if (!currentCub) continue;
                const anchor = li.querySelector('a');
                if (!anchor) continue;
                const name = extractBadgeName(anchor);
                const finalSpan = li.querySelector('span.final');
                const isFinal = !!(finalSpan && finalSpan.textContent.trim());
                currentBadge = { name, isFinal, requirements: [] };
                currentCub.badges.push(currentBadge);
            } else if (li.hasAttribute('data-show-reqs') && currentBadge) {
                const reqNumEl = li.querySelector('span.reqnum');
                if (reqNumEl) {
                    const reqTextEl = li.querySelector('div:not(.creole)');
                    const num = reqNumEl.textContent.trim();
                    currentBadge.requirements.push({
                        num,
                        text: reqTextEl ? reqTextEl.textContent.trim() : '',
                    });
                    if (/^#?[A-Za-z]/.test(num)) currentBadge.isPersonalAchievement = true;
                }
            }
        }

        return cubs;
    }

    // ── HTML Generation ───────────────────────────────────────────────────────

    const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, sans-serif; font-size: 13px; padding: 20px; color: #000; }

.controls {
  margin-bottom: 20px; padding: 12px 16px;
  background: #f0f4f0; border: 1px solid #c8d8c8; border-radius: 6px;
  display: flex; align-items: center; gap: 16px;
}
.controls .print-btn {
  padding: 8px 16px; font-size: 13px; cursor: pointer;
  background: #1a6b3c; color: #fff; border: none; border-radius: 4px;
}
.controls .print-btn:hover { background: #155530; }
.controls label { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; }

.cub-page { margin-bottom: 32px; }
.page-break { page-break-before: always; }

h1 {
  font-size: 1.25rem; font-weight: bold;
  border-bottom: 2px solid #2a2a2a; padding-bottom: 6px; margin-bottom: 14px;
}

.badge { margin-bottom: 14px; }

table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #bbb; padding: 5px 8px; vertical-align: top; text-align: left; }

.badge-header th {
  background: #e8e8e8; font-size: 0.95rem; font-weight: bold;
}
.badge.final .badge-header th {
  background: #fff3cd; border-top: 3px solid #d08000;
}
.final-label {
  font-weight: normal; font-size: 0.78rem; color: #a05000; margin-left: 10px;
}
.awarded {
  float: right; font-weight: normal; font-size: 0.9rem; white-space: nowrap;
}
.col-header th {
  background: #f4f4f4; font-size: 0.78rem; font-weight: bold; color: #444;
}
td.req-num { width: 42px; white-space: nowrap; font-weight: bold; }
th.req-num { width: 42px; }
td.check, th.check { width: 84px; text-align: center; font-size: 1rem; }
[data-personal-achievement] { display: none; }

@media print {
  .no-print { display: none !important; }
  body { padding: 8px; }
  .page-break { page-break-before: always; }
  .badge-header th,
  .badge.final .badge-header th,
  .col-header th {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}`;

    function buildHTML(cubs) {
        const cubSections = cubs.map((cub, i) => {
            const pageClass = i === 0 ? 'cub-page' : 'cub-page page-break';

            const badgeSections = cub.badges.map(badge => {
                const badgeClass = badge.isFinal ? 'badge final' : 'badge';
                const paAttr = badge.isPersonalAchievement ? ' data-personal-achievement="true"' : '';
                const finalLabel = badge.isFinal
                    ? '<span class="final-label">&#9733; Final requirements</span>' : '';

                const rows = badge.requirements.map(req => `
          <tr>
            <td class="req-num">${escHtml(req.num)}</td>
            <td>${escHtml(req.text)}</td>
            <td class="check">&#9744;</td>
          </tr>`).join('');

                return `
      <div class="${badgeClass}"${paAttr}>
        <table>
          <thead>
            <tr class="badge-header">
              <th colspan="3">
                ${escHtml(badge.name)}${finalLabel}
                <span class="awarded">Awarded  &#9744;</span>
              </th>
            </tr>
            <tr class="col-header">
              <th class="req-num">#</th>
              <th>Requirement</th>
              <th>Demonstrated</th>
            </tr>
          </thead>
          <tbody>${rows}
          </tbody>
        </table>
      </div>`;
            }).join('');

            return `
    <div class="${pageClass}">
      <h1>${escHtml(cub.name)}</h1>${badgeSections}
    </div>`;
        }).join('');

        // The closing </script> tag is split to avoid ending the surrounding script block
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Ready to Demonstrate Report</title>
<style>${CSS}</style>
</head>
<body>
<div class="controls no-print">
  <button class="print-btn" onclick="window.print()">&#128438;&nbsp;Print</button>
  <label>
    <input type="checkbox" id="hide-pa" onchange="document.querySelectorAll('[data-personal-achievement]').forEach(function(el){el.style.display=this.checked?'block':'';}.bind(this))">
    Show personal achievement badges
  </label>
</div>
${cubSections}
</body>
</html>`;
    }

    // ── Progression Planner Parsing ───────────────────────────────────────────

    function parsePlannerData() {
        const table = document.querySelector('#table-report-body table');
        if (!table) return null;

        // The on-screen sticky header is the first tr in tbody (the thead one is print-only)
        const headerRow = table.querySelector('tbody tr.sticky-row');
        if (!headerRow) return null;

        const cubs = [];
        for (const td of headerRow.querySelectorAll('td.caption')) {
            if (td.classList.contains('spacer')) continue;
            const title = td.getAttribute('title');
            if (title && title.trim()) cubs.push(title.trim());
        }
        if (cubs.length === 0) return null;

        const badges = [];
        let currentBadge = null;

        for (const row of table.querySelectorAll('tbody tr')) {
            if (row.classList.contains('sticky-row')) continue;

            const dividerCell = row.querySelector('td.divider');
            if (dividerCell) {
                const nameEl = dividerCell.querySelector('span.name');
                currentBadge = { name: nameEl ? nameEl.textContent.trim() : '', requirements: [] };
                badges.push(currentBadge);
                continue;
            }

            if (!row.hasAttribute('data-reqid') || !currentBadge) continue;

            const reqNumEl = row.querySelector('td.reqnum');
            const stickyEls = row.querySelectorAll('td.sticky-col');
            // stickyEls[0] = req num col, stickyEls[1] = req text col
            const textTd = stickyEls.length >= 2 ? stickyEls[1] : null;

            const num = reqNumEl ? reqNumEl.textContent.trim().replace(/^#/, '') : '';
            const text = textTd ? (textTd.getAttribute('title') || textTd.textContent.trim()) : '';

            const completions = [];
            for (const td of row.querySelectorAll('td.white')) {
                completions.push(td.classList.contains('y'));
            }

            if (completions.length === cubs.length) {
                currentBadge.requirements.push({ num, text, completions });
            }
        }

        return { cubs, badges };
    }

    // ── Progression Planner HTML Generation ──────────────────────────────────

    const PLANNER_CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, sans-serif; font-size: 12px; padding: 16px; color: #000; }

.controls {
  margin-bottom: 16px; padding: 10px 14px;
  background: #f0f4f0; border: 1px solid #c8d8c8; border-radius: 6px;
  display: flex; align-items: center; gap: 16px;
}
.controls .print-btn {
  padding: 8px 16px; font-size: 13px; cursor: pointer;
  background: #1a6b3c; color: #fff; border: none; border-radius: 4px;
}
.controls .print-btn:hover { background: #155530; }
.controls .copy-btn {
  padding: 8px 16px; font-size: 13px; cursor: pointer;
  background: #2a6496; color: #fff; border: none; border-radius: 4px;
}
.controls .copy-btn:hover { background: #1f4d72; }
.controls .dl-btn {
  padding: 8px 16px; font-size: 13px; cursor: pointer;
  background: #6a3d9a; color: #fff; border: none; border-radius: 4px;
}
.controls .dl-btn:hover { background: #522e78; }

table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #bbb; padding: 4px 6px; vertical-align: top; text-align: left; }

thead th {
  background: #e8e8e8; font-weight: bold; white-space: nowrap;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  vertical-align: middle;
}
thead th.cub {
  text-align: left;
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  white-space: nowrap;
  vertical-align: bottom;
  padding: 4px 2px;
  line-height: 1.7em;
}

tr.badge-row td { background: #d4e8d4; font-weight: bold; font-size: 0.9rem;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }

tr.badge-start td { border-top: 2px solid #000; }

td.req-num { width: 48px; white-space: nowrap; font-weight: bold; }
td.req-badge { width: 160px; white-space: nowrap; }
td.cub { text-align: center; width: 28px; }

@page { size: landscape; margin: 12mm; }
@media print {
  .no-print { display: none !important; }
  body { padding: 4px; font-size: 11px; }
}`;

    function buildPlannerHTML(data) {
        const cubHeaders = data.cubs.map(name => `<th class="cub">${escHtml(name)}</th>`).join('');

        const rows = [];
        for (const badge of data.badges) {
            let firstRow = true;
            for (const req of badge.requirements) {
                const cells = req.completions.map(done => `<td class="cub">${done ? '&#10003;' : ''}</td>`).join('');
                rows.push(`<tr${firstRow ? ' class="badge-start"' : ''}>
    <td class="req-badge">${escHtml(badge.name)}</td>
    <td class="req-num">${escHtml(req.num)}</td>
    <td>${escHtml(req.text)}</td>
    ${cells}
  </tr>`);
                firstRow = false;
            }
        }

        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Progression Planner</title>
<style>${PLANNER_CSS}</style>
</head>
<body>
<div class="controls no-print">
  <button id="planner-print-btn" class="print-btn">&#128438;&nbsp;Print</button>
  <button id="planner-copy-btn" class="copy-btn">&#128203;&nbsp;Copy (TSV)</button>
  <button id="planner-dl-btn" class="dl-btn">&#128229;&nbsp;Download for Excel</button>
</div>
<table>
  <thead>
    <tr>
      <th>Badge</th>
      <th>Req #</th>
      <th>Requirement</th>
      ${cubHeaders}
    </tr>
  </thead>
  <tbody>
  ${rows.join('\n  ')}
  </tbody>
</table>
</body>
</html>`;
    }

    // ── Button Actions ────────────────────────────────────────────────────────

    function openPrintView() {
        const cubs = parseReportData();
        if (cubs.length === 0) {
            alert('No report data found. Make sure the Ready to Demonstrate report is loaded.');
            return;
        }
        const html = buildHTML(cubs);
        const win = window.open('', '_blank');
        if (!win) {
            alert('Pop-up blocked. Please allow pop-ups for scoutstracker.ca and try again.');
            return;
        }
        win.document.write(html);
        win.document.close();
    }

    function copyPlannerTable(win, btn) {
        const table = win.document.querySelector('table');

        // TSV for plain-text fallback
        const tsvRows = [];
        for (const tr of table.querySelectorAll('tr')) {
            const cells = [...tr.querySelectorAll('th, td')].map(cell =>
                cell.textContent.replace(/\t|\n/g, ' ').trim()
            );
            tsvRows.push(cells.join('\t'));
        }

        // Build a fresh HTML table with every style inlined so Excel sees them.
        // CSS classes are ignored by Excel's HTML paste — only inline styles work.
        const S = {
            thBase: 'background:#e8e8e8; border:1px solid #bbb; font-weight:bold; padding:4px 6px; vertical-align:bottom;',
            thCub: 'background:#e8e8e8; border:1px solid #bbb; font-weight:bold; padding:4px 2px; white-space:nowrap; mso-rotate:90; vertical-align:bottom;',
            tdBase: 'border:1px solid #bbb; padding:4px 6px; vertical-align:top;',
            tdBold: 'border:1px solid #bbb; padding:4px 6px; vertical-align:top; font-weight:bold; white-space:nowrap;',
            tdCenter: 'border:1px solid #bbb; padding:4px 6px; text-align:center; vertical-align:top; color:#080;',
            sepTop: 'border-top:2px solid #555;',
        };

        const headerThs = [...table.querySelectorAll('thead th')];

        // Column widths in pixels. Excel reads width attributes from the first row.
        // Fixed: Badge=126, Req#=42, Requirement=767. Cub columns=26 each.
        const colWidths = [126, 42, 767];
        const headerCells = headerThs.map((th, i) => {
            const w = i < 3 ? colWidths[i] : 26;
            const style = th.classList.contains('cub') ? S.thCub : S.thBase;
            return `<th width="${w}" style="${style}">${th.textContent.trim()}</th>`;
        }).join('');

        const bodyRows = [...table.querySelectorAll('tbody tr')].map(tr => {
            const sep = tr.classList.contains('badge-start') ? S.sepTop : '';
            const cells = [...tr.querySelectorAll('td')].map(td => {
                let base = td.classList.contains('cub') ? S.tdCenter
                    : (td.classList.contains('req-badge') || td.classList.contains('req-num')) ? S.tdBold
                        : S.tdBase;
                return `<td style="${base}${sep}">${td.textContent.trim()}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        const html = `<html><body><table border="1" style="border-collapse:collapse;">`
            + `<thead><tr>${headerCells}</tr></thead>`
            + `<tbody>${bodyRows}</tbody>`
            + `</table></body></html>`;

        const flash = function () {
            const orig = btn.innerHTML;
            btn.innerHTML = '&#10003;&nbsp;Copied!';
            btn.disabled = true;
            setTimeout(function () { btn.innerHTML = orig; btn.disabled = false; }, 2000);
        };

        const item = new win.ClipboardItem({
            'text/plain': new Blob([tsvRows.join('\n')], { type: 'text/plain' }),
            'text/html': new Blob([html], { type: 'text/html' }),
        });

        win.navigator.clipboard.write([item]).then(flash).catch(function () {
            win.navigator.clipboard.writeText(tsvRows.join('\n')).then(flash);
        });
    }

    function downloadPlannerXLS(win) {
        const table = win.document.querySelector('table');
        const headerThs = [...table.querySelectorAll('thead th')];
        const cubCount = headerThs.filter(th => th.classList.contains('cub')).length;

        function escXml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        function borders(thickTop) {
            const top = thickTop
                ? '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#555555"/>'
                : '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BBBBBB"/>';
            return `<Borders>${top}<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BBBBBB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BBBBBB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BBBBBB"/></Borders>`;
        }

        // Each style has a badge-start (S) variant with a thicker top border.
        // "Default" ss:Name="Normal" is required by Excel to validate the file.
        // Child element order within <Style> is schema-enforced: Alignment, Borders, Font, Interior.
        const styles = `<Styles>
<Style ss:ID="Default" ss:Name="Normal"/>
<Style ss:ID="s0"><Alignment ss:Vertical="Top" ss:WrapText="1"/>${borders(false)}</Style>
<Style ss:ID="s0S"><Alignment ss:Vertical="Top" ss:WrapText="1"/>${borders(true)}</Style>
<Style ss:ID="sB"><Alignment ss:Vertical="Top"/>${borders(false)}<Font ss:Bold="1"/></Style>
<Style ss:ID="sBS"><Alignment ss:Vertical="Top"/>${borders(true)}<Font ss:Bold="1"/></Style>
<Style ss:ID="sC"><Alignment ss:Horizontal="Center" ss:Vertical="Top"/>${borders(false)}<Font ss:Color="#008800"/></Style>
<Style ss:ID="sCS"><Alignment ss:Horizontal="Center" ss:Vertical="Top"/>${borders(true)}<Font ss:Color="#008800"/></Style>
<Style ss:ID="sH"><Alignment ss:Horizontal="Left" ss:Vertical="Bottom"/>${borders(false)}<Font ss:Bold="1"/><Interior ss:Color="#E8E8E8" ss:Pattern="Solid"/></Style>
<Style ss:ID="sHC"><Alignment ss:Horizontal="Center" ss:Vertical="Bottom" ss:Rotate="90"/>${borders(false)}<Font ss:Bold="0"/><Interior ss:Color="#E8E8E8" ss:Pattern="Solid"/></Style>
</Styles>`;

        // Column widths in points (px * 0.75): Badge=94.5, Req#=31.5, Requirement=575, Cub=19.5
        const cols = '<Column ss:Width="94.5"/><Column ss:Width="31.5"/><Column ss:Width="575"/>'
            + '<Column ss:Width="19.5"/>'.repeat(cubCount);

        const headerRow = '<Row ss:AutoFitHeight="1">'
            + headerThs.map(th => {
                const style = th.classList.contains('cub') ? 'sHC' : 'sH';
                return `<Cell ss:StyleID="${style}"><Data ss:Type="String">${escXml(th.textContent.trim())}</Data></Cell>`;
            }).join('')
            + '</Row>';

        const dataRows = [...table.querySelectorAll('tbody tr')].map(tr => {
            const S = tr.classList.contains('badge-start');
            const cells = [...tr.querySelectorAll('td')].map(td => {
                const style = td.classList.contains('cub') ? (S ? 'sCS' : 'sC')
                    : (td.classList.contains('req-badge') || td.classList.contains('req-num')) ? (S ? 'sBS' : 'sB')
                        : (S ? 's0S' : 's0');
                return `<Cell ss:StyleID="${style}"><Data ss:Type="String">${escXml(td.textContent.trim())}</Data></Cell>`;
            }).join('');
            return `<Row>${cells}</Row>`;
        }).join('');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>`
            + `<?mso-application progid="Excel.Sheet"?>`
            + `<Workbook`
            + ` xmlns="urn:schemas-microsoft-com:office:spreadsheet"`
            + ` xmlns:o="urn:schemas-microsoft-com:office:office"`
            + ` xmlns:x="urn:schemas-microsoft-com:office:excel"`
            + ` xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"`
            + ` xmlns:html="http://www.w3.org/TR/REC-html40">`
            + styles
            + `<Worksheet ss:Name="Progression Planner">`
            + `<Table x:FullColumns="1" x:FullRows="1">${cols}${headerRow}${dataRows}</Table>`
            + `<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">`
            + `<PageSetup><Layout x:Orientation="Landscape"/></PageSetup>`
            + `</WorksheetOptions>`
            + `</Worksheet></Workbook>`;

        const blob = new win.Blob([xml], { type: 'application/vnd.ms-excel' });
        const url = win.URL.createObjectURL(blob);
        const a = win.document.createElement('a');
        a.href = url;
        a.download = 'progression-planner.xls';
        win.document.body.appendChild(a);
        a.click();
        win.document.body.removeChild(a);
        win.URL.revokeObjectURL(url);
    }

    function openPlannerView() {
        const data = parsePlannerData();
        if (!data || data.badges.length === 0) {
            alert('No report data found. Make sure the Progression Planner report is loaded.');
            return;
        }
        const html = buildPlannerHTML(data);
        const win = window.open('', '_blank');
        if (!win) {
            alert('Pop-up blocked. Please allow pop-ups for scoutstracker.ca and try again.');
            return;
        }
        win.document.write(html);
        win.document.close();
        win.document.getElementById('planner-print-btn').addEventListener('click', function () {
            win.print();
        });
        win.document.getElementById('planner-copy-btn').addEventListener('click', function () {
            copyPlannerTable(win, this);
        });
        win.document.getElementById('planner-dl-btn').addEventListener('click', function () {
            downloadPlannerXLS(win);
        });
    }

    // ── Button Injection ──────────────────────────────────────────────────────

    function injectButton() {
        const isRtd = [...document.querySelectorAll('h1.name')]
            .some(h => h.offsetParent !== null && h.textContent.trim() === 'Ready to Demonstrate');
        const existing = document.getElementById('st-print-btn');
        if (existing) {
            if (!isRtd) existing.remove();
            return isRtd;
        }
        if (!isRtd) return false;
        const reportBody = document.querySelector('#report-body');
        if (!reportBody || !reportBody.querySelector('li.divider')) return false;

        const btn = document.createElement('button');
        btn.id = 'st-print-btn';
        btn.innerHTML = '&#128438;&nbsp;Print Formatted Report';
        Object.assign(btn.style, {
            margin: '15px 10px 1em 10px',
            padding: '8px 18px',
            fontSize: '14px',
            cursor: 'pointer',
            background: 'var(--color-background-divider)',
            color: 'var(--color-divider)',
            border: 'none',
            borderRadius: '4px',
            display: 'block',
            boxShadow: 'rgba(0,0,0, .7) 2px 2px 4px',
        });
        btn.addEventListener('click', openPrintView);
        reportBody.parentNode.insertBefore(btn, reportBody);

        document.querySelector('#report-instructions a')?.remove();
        return true;
    }

    function injectPlannerButton() {
        const isPlanner = [...document.querySelectorAll('h1.name')]
            .some(h => h.offsetParent !== null && h.textContent.trim() === 'Progression Planner');
        const existing = document.getElementById('st-planner-btn');
        if (existing) {
            if (!isPlanner) existing.remove();
            return isPlanner;
        }
        if (!isPlanner) return false;
        const reportBody = document.querySelector('#table-report-body');
        if (!reportBody || !reportBody.querySelector('tr[data-reqid]')) return false;

        const btn = document.createElement('button');
        btn.id = 'st-planner-btn';
        btn.innerHTML = '&#128438;&nbsp;Export Formatted Report';
        Object.assign(btn.style, {
            margin: '15px 10px 1em 10px',
            padding: '8px 18px',
            fontSize: '14px',
            cursor: 'pointer',
            background: 'var(--color-background-divider)',
            color: 'var(--color-divider)',
            border: 'none',
            borderRadius: '4px',
            display: 'block',
            boxShadow: 'rgba(0,0,0, .7) 2px 2px 4px',
        });
        btn.addEventListener('click', openPlannerView);
        reportBody.parentNode.insertBefore(btn, reportBody);
        return true;
    }

    // ── SPA-aware Activation ──────────────────────────────────────────────────

    let activeObs = null;

    function watchForReport() {
        if (activeObs) {
            activeObs.disconnect();
            activeObs = null;
        }

        function tryInject() {
            const rtdDone = injectButton();
            const plannerDone = injectPlannerButton();
            if (rtdDone || plannerDone) {
                activeObs.disconnect();
                activeObs = null;
            }
        }

        // Watch the whole body subtree so we catch h1.name and #report-body
        // updating in any order — disconnect once the button is successfully injected.
        activeObs = new MutationObserver(tryInject);
        activeObs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
        tryInject();
    }

    watchForReport();

    // Re-check on SPA hash navigation
    window.addEventListener('hashchange', () => {
        document.getElementById('st-print-btn')?.remove();
        document.getElementById('st-planner-btn')?.remove();
        watchForReport();
    });
})();
