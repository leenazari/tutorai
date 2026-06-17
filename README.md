# Tutorai Streaming Upgrade

This makes feedback appear progressively (word by word) instead of all at once after a long wait. Total time is similar, but it FEELS far faster because the student sees text within 1-2 seconds.

## Files in this zip

```
tutorai-streaming/
├── vercel.json                              (NEW - repo root, London region)
└── src/
    ├── app/
    │   └── api/
    │       └── feedback/
    │           └── route.ts                 (REPLACES - now streams)
    └── components/
        └── Tutor.tsx                        (REPLACES - reads the stream live)
```

## How to drop them in

1. Unzip this folder on your computer
2. Go to https://github.com/leenazari/tutorai
3. Click "Add file" then "Upload files"
4. Drag ALL the contents (the `vercel.json` file AND the `src` folder) into the upload box
5. GitHub keeps the folder structure and overwrites the two existing files plus adds vercel.json
6. Scroll down, commit changes
7. Wait about 90 seconds for Vercel to redeploy, then test

## What changed

1. **route.ts** now uses Anthropic streaming. Instead of waiting for the whole response, it sends text as Claude writes it. The feedback is formatted with section markers (STRENGTHS, IMPROVEMENTS, etc) followed by a compact JSON data block at the end for the teacher dashboard.

2. **Tutor.tsx** reads the stream and renders each section the moment it arrives. The student sees "What you did well" fill in first, then "Areas to improve", and so on. The rating badge and voice playback happen once the full response lands.

3. **vercel.json** pins functions to London for lower latency (include it even if you already added it before, it will just overwrite with the same content).

## What to expect

- First words appear in 1-2 seconds
- Sections fill in progressively over the next several seconds
- Voice plays once the full response is ready
- Teacher dashboard still gets the full scoring (saved silently at the end)

## If it does NOT stream (shows everything at once after a pause)

That means something is buffering the response. Tell Claude in the chat and we can adjust the headers or runtime. The most common fix is already in place (no-transform cache header plus X-Accel-Buffering off), so it should work, but Vercel behaviour can vary.
