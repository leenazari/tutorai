# Tutorai Speed Fixes

This zip contains 2 files that will speed up your feedback API.

## Files

```
tutorai-speed-fixes/
├── vercel.json                                  (NEW - goes at repo root)
└── src/
    └── app/
        └── api/
            └── feedback/
                └── route.ts                     (REPLACES existing file)
```

## How to drop them in

### Option A: Drag the folder contents into GitHub

1. Go to https://github.com/leenazari/tutorai
2. Click "Add file" -> "Upload files"
3. Open the unzipped `tutorai-speed-fixes` folder on your computer
4. Drag ALL the contents (both the `vercel.json` file AND the `src` folder) into the upload area in GitHub
5. GitHub will preserve the folder structure and place files in the right locations
6. Scroll down, commit changes

### Option B: One file at a time

If drag-and-drop is fiddly:

1. Create `vercel.json` at repo root (Add file -> Create new file, name it "vercel.json", paste content)
2. Replace `src/app/api/feedback/route.ts` (navigate to existing file, click pencil, replace content)

## What changed and why

1. **`vercel.json`** sets your serverless functions to run in London (`lhr1`) instead of US East. Cuts the network round-trip by 500ms+.

2. **`route.ts`** lowers `max_tokens` from 2500 to 1200 and tightens the prompt. Claude stops generating sooner and has less to read before it can start writing.

Expected result: 10-15 seconds instead of 60.
