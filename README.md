# Product Randomizer

A simple Node.js script that selects a random product JSON from the `products/` directory and outputs details to the terminal. The platform is chosen at random from `platforms.json`, and only products matching the selected platform are considered.

## Setup

1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Add your product JSON files to the `products/` directory.
3. List available platforms in `platforms.json`.

## Running

Execute the script from the project root:

```bash
node randomize.js
```

The script prints the selected product and its information. It does not create or modify any files.

## Product Schema

Each product file must contain:

- `listingName` (string)
- `officialName` (string)
- `imagePolished` (non-empty array of strings)
- `selectedPlatform` (string)
- `selectedUrl` (string)

Files missing these fields or containing invalid JSON are skipped with a warning.
