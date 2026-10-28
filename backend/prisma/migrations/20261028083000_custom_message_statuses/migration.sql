-- Message statuses become admin-editable rows; existing values are kept as keys
ALTER TABLE "ContactMessage" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ContactMessage" ALTER COLUMN "status" TYPE TEXT USING "status"::text;
ALTER TABLE "ContactMessage" ALTER COLUMN "status" SET DEFAULT 'NEW';
DROP TYPE "MessageStatus";

CREATE TABLE "MessageStatus" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "inInbox" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MessageStatus_pkey" PRIMARY KEY ("key")
);

INSERT INTO "MessageStatus" ("key", "label", "color", "inInbox", "sortOrder") VALUES
    ('NEW', 'New', 'sky', true, 0),
    ('IN_PROGRESS', 'In progress', 'amber', true, 1),
    ('REPLIED', 'Replied', 'emerald', true, 2),
    ('CLOSED', 'Closed', 'slate', true, 3),
    ('SPAM', 'Spam', 'red', false, 4),
    ('ARCHIVED', 'Archived', 'zinc', false, 5);
