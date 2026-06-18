READ THIS BEFORE UPLOADING
==========================

The files in this folder are correct and already match what is on your
GitHub repo. Uploading them again will NOT change what is live, because
that is not the problem.

THE ACTUAL PROBLEM
------------------
Your Vercel production is frozen on the 19 April deployment because the
project is in INSTANT ROLLBACK mode. While that is on, every new build
(including these files) is ignored and the old version stays live.

THE FIX (about 10 seconds, no files needed)
--------------------------------------------
1. Go to the Vercel deployments list.
2. On the Apr 19 row, click the "..." menu.
3. Click "Instant Rollback" (the top item, circular arrow icon).
   This toggles rollback OFF.
4. Production immediately switches to your newest commit, which already
   has the 3 stage code. The site updates on its own.

After that, "Promote" will no longer be greyed out, and future commits
will deploy automatically as normal.

THESE FILES (reference copy)
----------------------------
This is the exact tested 3 stage assessment build. It is the same code
already on your repo (commit 1d23ca2 and later). If you ever need to
re-establish it cleanly, upload the src folder via GitHub. But you should
not need to: the code is already there. The only blocker is the rollback
toggle above.
