# Badger
### ScoutsTracker Report Print Formatter

A Chrome extension that adds a **🖨️ Print Formatted Report** button to the ScoutsTracker "Ready to Demonstrate" report, giving you a clean, printable checklist — one page per Cub — that you can use at meetings or copy into Excel.

---

## What it does

When you open the Ready to Demonstrate report on [scoutstracker.ca](https://scoutstracker.ca/cubs/#report), the extension adds a **Print Formatted Report** button above the list. Clicking it opens a new tab with the Ready to Demonstrate data formatted in a more printer friendly format. 

- One page per Cub (with proper page breaks when printing)
- One table per badge, showing only the outstanding requirements
- A checkbox for each skill so you can tick them off as Cubs demonstrate
- An **Awarded** checkbox in each badge heading to sign off the whole badge
- Badges where these are the **final requirements** highlighted in amber

---

## Installation

> **Note:** This extension is not on the Chrome Web Store, so you need to load it manually. This is a one-time setup that takes about two minutes.

### Step 1 — Download the extension files

Download or copy the `badge-extension` folder to your computer. It should contain two files:

```
badge-extension/
├── manifest.json
└── content.js
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

The Print Report button opens in a new tab. Chrome will block this the first time:

1. After clicking **Print Report**, look for the blocked pop-up icon in the address bar
2. Click it and choose **Always allow pop-ups from scoutstracker.ca**
3. Click **Print Report** again — it will work from now on

---

## How to use it

1. Go to [scoutstracker.ca](https://scoutstracker.ca/cubs/) and log in
2. Navigate to **Reports → Ready to Demonstrate**
3. Click the green **🖨️ Print Formatted Report** button that appears above the list
4. A new tab opens with the formatted report
5. Click **Print** (or use `Ctrl+P` / `Cmd+P`) to print, or select and copy the tables into Excel

---

## Troubleshooting

**The Print Report button doesn't appear**
- Make sure you are on the *Ready to Demonstrate* report, not another report type
- Try refreshing the page
- Check that the extension is enabled at `chrome://extensions`

**The new tab is blank or blocked**
- Follow Step 4 above to allow pop-ups from scoutstracker.ca

**The extension stopped working after a Chrome update**
- Go to `chrome://extensions`, find ScoutsTracker Print Reporter, and click the refresh icon. Then, reload the [scoutstracker](https://scoutstracker.ca/cubs/) site.
