-- Fix: Change Id columns from UUID to TEXT type

-- First, drop and recreate GroupMilestoneComments with TEXT Id
DROP TABLE IF EXISTS "GroupMilestoneComments";

CREATE TABLE "GroupMilestoneComments" (
    "Id" text NOT NULL,
    "GroupMilestoneId" text NOT NULL,
    "UserId" text NOT NULL,
    "UserName" text NOT NULL,
    "UserRole" text NOT NULL,
    "Content" text NOT NULL,
    "CreatedAt" timestamp without time zone NOT NULL,
    CONSTRAINT "PK_GroupMilestoneComments" PRIMARY KEY ("Id")
);

-- Drop and recreate GroupMilestoneGrades with TEXT Id
DROP TABLE IF EXISTS "GroupMilestoneGrades";

CREATE TABLE "GroupMilestoneGrades" (
    "Id" text NOT NULL,
    "GroupMilestoneId" text NOT NULL,
    "GradedBy" text NOT NULL,
    "GraderName" text NOT NULL,
    "GraderRole" text NOT NULL,
    "Score" double precision NOT NULL,
    "Feedback" text,
    "GradedAt" timestamp without time zone NOT NULL,
    CONSTRAINT "PK_GroupMilestoneGrades" PRIMARY KEY ("Id")
);

-- Verify
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE
    table_name IN (
        'GroupMilestoneComments',
        'GroupMilestoneGrades'
    )
ORDER BY table_name, ordinal_position;