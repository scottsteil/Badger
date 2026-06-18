# Badger
### ScoutsTracker Report Print Formatter

A Chrome extension that enhances two ScoutsTracker reports with print and Excel export buttons: namely the "Ready to Demonstrate" and "Progression Planner" reports.

---

## What it does

### Ready to Demonstrate report

When you open the Ready to Demonstrate report, the extension adds a **🖨️ Print Formatted Report** button above the list. Clicking it opens a new tab with a clean, printable checklist.

- One page per Cub (with proper page breaks when printing)
- One table per badge, showing only the outstanding requirements
- A checkbox for each skill so you can tick them off as Cubs demonstrate
- An **Awarded** checkbox in each badge heading to sign off the whole badge
- Badges where these are the **final requirements** highlighted in amber

### Progression Planner report

When you open the Progression Planner report, the extension adds three buttons:

- **🖨️ Print** — opens a new tab with a formatted grid (badge requirements as rows, Cubs as columns) and prints it in landscape
- **📋 Copy (TSV)** — copies the table as tab-separated text for pasting into Google Sheets or any spreadsheet
- **📥 Download for Excel** — downloads a `.xls` file that opens directly in Excel with full formatting: column widths, rotated cub-name headers, grey header background, bold badge/requirement cells, green checkmarks, and a thick dividing line between each badge group

---

## Installation

> **Note:** This extension is not on the Chrome Web Store, so you need to load it manually. This is a one-time setup that takes about two minutes.

### Step 1 — Download the extension files

Download or copy the project to your computer (Code > Download Zip). It should contain the following files:

```
badger/
├── LICENSE
├── README.md
├── content.js
└── manifest.json
```

### Step 2 — Open Chrome Extensions

1. Open **Google Chrome**
2. In the address bar, type `chrome://extensions` and press **Enter**
3. In the top-right corner, turn on **Developer mode**

### Step 3 — Load the extension

1. Click **Load unpacked** (appears after enabling Developer mode)
2. Navigate to and select the `badge-extension` folder
3. The extension will appear in your list as **ScoutsTracker Print Reporter**

### Step 4 — Allow pop-ups (first time only)

The buttons open reports in a new tab. Chrome will block this the first time:

1. After clicking a report button, look for the blocked pop-up icon in the address bar
2. Click it and choose **Always allow pop-ups from scoutstracker.ca**
3. Click the button again — it will work from now on

---

## How to use it

### Ready to Demonstrate

1. Go to [scoutstracker.ca](https://scoutstracker.ca/cubs/) and log in
2. Navigate to **Reports → Ready to Demonstrate**
3. Click the green **🖨️ Print Formatted Report** button that appears above the list
4. A new tab opens with the formatted report
5. Click **Print** (or use `Ctrl+P` / `Cmd+P`) to print

### Progression Planner

1. Navigate to **Reports → Progression Planner**
2. Click the green **🖨️ Print Progression Planner** button that appears above the table
3. A new tab opens with the formatted grid — use the buttons at the top to:
   - **Print** — send to printer in landscape
   - **Copy (TSV)** — copy to clipboard for pasting into Google Sheets
   - **Download for Excel** — download a `.xls` file; double-click it to open in Excel with formatting applied
     > The file is technically formatted as xml. This may cause Excel to complain that the extension doesn't match the file type, but it will open fine.

---

## Troubleshooting

**A button doesn't appear**
- Make sure you are on the correct report page
- Try refreshing the page
- Check that the extension is enabled at `chrome://extensions`

**The new tab is blank or blocked**
- Follow Step 4 above to allow pop-ups from scoutstracker.ca

**The extension stopped working after a Chrome update**
- Go to `chrome://extensions`, find ScoutsTracker Print Reporter, and click the refresh icon. Then, reload the [scoutstracker](https://scoutstracker.ca/cubs/) site.
