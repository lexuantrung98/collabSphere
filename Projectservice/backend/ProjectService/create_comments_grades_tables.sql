-- Create GroupMilestoneComments table
CREATE TABLE IF NOT EXISTS "GroupMilestoneComments" (
    "Id" text NOT NULL,
    "GroupMilestoneId" text NOT NULL,
    "UserId" text NOT NULL,
    "UserName" text NOT NULL,
    "UserRole" text NOT NULL,
    "Content" text NOT NULL,
    "CreatedAt" timestamp without time zone NOT NULL,
    CONSTRAINT "PK_GroupMilestoneComments" PRIMARY KEY ("Id")
);

-- Create GroupMilestoneGrades table
CREATE TABLE IF NOT EXISTS "GroupMilestoneGrades" (
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

-- Verify tables were created
SELECT 'GroupMilestoneComments table created' as status
WHERE
    EXISTS (
        SELECT
        FROM information_schema.tables
        WHERE
            table_name = 'GroupMilestoneComments'
    );

SELECT 'GroupMilestoneGrades table created' as status
WHERE
    EXISTS (
        SELECT
        FROM information_schema.tables
        WHERE
            table_name = 'GroupMilestoneGrades'
    );