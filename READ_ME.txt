FULL-SCREEN BRANDED SCORECARD WITH DOWNLOAD - one file change
==============================================================

Replaces ONE file: src/components/Tutor.tsx

What changed:
- The end-of-assessment scorecard now takes the FULL screen (the scenario
  brief no longer sits next to it). The split screen is only used during
  the three stages.
- It uses the light brand theme from the mockup (white cards, #3366FF
  brand blue), not the dark panel.
- A DOWNLOAD button (top right and at the bottom) saves the scorecard as a
  self-contained HTML file the student can keep or print.
- Still includes everything: percentage and rating band, What you did well,
  Areas to improve, encouragement, action plan, stage breakdown, the six
  skill areas, and every competency mapped to its framework.

HOW TO UPLOAD
-------------
1. Go to https://github.com/leenazari/tutorai
2. Add file -> Upload files
3. Drag the "src" folder from this zip into the upload box
4. It overwrites src/components/Tutor.tsx
5. Commit

tutorai-gca2 auto-builds and deploys. No database change, no other files.
Tested with a full production build.
