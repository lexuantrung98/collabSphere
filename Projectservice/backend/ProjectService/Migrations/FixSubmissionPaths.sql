-- Migration Script: Fix Submission File Paths
-- Purpose: Update old file paths to new submissions folder structure
-- Date: 2026-01-27
-- Issue: Files were moved from /uploads/ to /uploads/submissions/ but database still references old paths

-- Step 1: Preview changes before applying
SELECT
    "Id",
    "Content" AS "OldPath",
    REPLACE(
        "Content",
        '/uploads/',
        '/uploads/submissions/'
    ) AS "NewPath",
    "SubmittedAt"
FROM "ProjectSubmissions"
WHERE
    "Content" LIKE '/uploads/%'
    AND "Content" NOT LIKE '/uploads/submissions/%'
    AND "Content" NOT LIKE 'http%';
-- Exclude external links

-- Step 2: Apply the migration
-- Uncomment below to execute:

UPDATE "ProjectSubmissions"
SET
    "Content" = REPLACE(
        "Content",
        '/uploads/',
        '/uploads/submissions/'
    )
WHERE
    "Content" LIKE '/uploads/%'
    AND "Content" NOT LIKE '/uploads/submissions/%'
    AND "Content" NOT LIKE 'http%';
-- Exclude external links

-- Step 3: Verify the update
SELECT
    "Id",
    "Content",
    "SubmittedAt",
    "Grade"
FROM "ProjectSubmissions"
WHERE
    "Content" LIKE '/uploads/submissions/%'
ORDER BY "SubmittedAt" DESC;

-- Expected Results:
-- Before: /uploads/abc-123_file.pdf
-- After:  /uploads/submissions/abc-123_file.pdf