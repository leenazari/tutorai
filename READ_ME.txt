SCORECARD ON END SCREEN - one file change
==========================================

This replaces ONE file: src/components/Tutor.tsx

What changed:
After the friendly summary (strengths, improvements, action plan), the
student now also sees the FULL scorecard at the end of the assessment:
- Overall percentage and rating band
- Stage breakdown (3 bars)
- Skill areas (the 6 categories)
- Every competency mapped to its real framework (Care Certificate, Care
  Act, NMC, NEWS2, etc) with met / partial / not met

HOW TO UPLOAD
-------------
1. Go to https://github.com/leenazari/tutorai
2. Add file -> Upload files
3. Drag the "src" folder from this zip into the upload box
4. It overwrites src/components/Tutor.tsx
5. Commit

Your new Vercel project (tutorai-gca2) will auto-build and deploy it.
No database change, no other files. Tested with a full production build.
