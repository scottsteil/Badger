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

    // ── Button Injection ──────────────────────────────────────────────────────

    function injectButton() {
        if (document.getElementById('st-print-btn')) return;
        const reportBody = document.querySelector('#report-body');
        if (!reportBody || !reportBody.querySelector('li.divider')) return;

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
    }

    // ── SPA-aware Activation ──────────────────────────────────────────────────

    function watchForReport() {
        const reportBody = document.querySelector('#report-body');
        if (reportBody) {
            injectButton();
            // Watch for data to be injected into #report-body by the SPA
            const obs = new MutationObserver(injectButton);
            obs.observe(reportBody, { childList: true });
        } else {
            // Wait for #report-body to appear in the DOM
            const obs = new MutationObserver(() => {
                if (document.querySelector('#report-body')) {
                    obs.disconnect();
                    watchForReport();
                }
            });
            obs.observe(document.body, { childList: true, subtree: true });
        }
    }

    watchForReport();

    // Re-check on SPA hash navigation
    window.addEventListener('hashchange', () => {
        const existing = document.getElementById('st-print-btn');
        if (existing) existing.remove();
        watchForReport();
    });
})();
