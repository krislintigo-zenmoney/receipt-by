# Receipt BY

# IMPORTANT NOTICE:
### With new Recaptcha v2 protection on the API's side, this tool is no longer working.
### I was not able to find a way to bypass the captcha.

# 

Small CLI utility for fetching Belarus receipt data from `ch.info-center.by` and saving it as local JSON and a readable HTML receipt.

The tool asks for a receipt number and date, downloads the receipt data, normalizes it into an internal format, and renders a polished HTML version.

## Requirements

- Node.js 22 or newer
- pnpm
- Access to `https://ch.info-center.by` (connection requires Belarusian IP)

## Installation

```sh
pnpm install
```

## Usage

Run the converter:

```sh
pnpm run convert
```

The utility will ask for:

```text
Receipt number (24 digits):
Date (YYYY-MM-DD):
```

Use the receipt UI number as the receipt number. Enter the receipt date in ISO date format, for example:

```text
Receipt number (24 digits): 8FAB703F74748FDE1D0BD551
Date (YYYY-MM-DD): 2026-05-07
```

When the receipt is found, the result is saved to:

```text
.data/<receipt-id>/
```

The folder contains:

- `<receipt-id>.html` - rendered HTML receipt
- `<receipt-id>.json` - normalized receipt data used by the renderer
- `<receipt-id>.raw.json` - raw API response from `ch.info-center.by`

Example:

```text
.data/8FAB703F74748FDE1D0BD551/
  8FAB703F74748FDE1D0BD551.html
  8FAB703F74748FDE1D0BD551.json
  8FAB703F74748FDE1D0BD551.raw.json
```

Open the generated HTML file in a browser to view the receipt.

## Privacy

Generated receipts may contain personal or purchase-related data. Keep `.data/` local unless you intentionally want to share exported receipts.
