-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "editToken" TEXT NOT NULL,
    "englishName" TEXT,
    "chineseName" TEXT,
    "grade" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationCard" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT,
    "room" TEXT NOT NULL,
    "seat" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_code_key" ON "Person"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Person_editToken_key" ON "Person"("editToken");

-- CreateIndex
CREATE UNIQUE INDEX "LocationCard_code_key" ON "LocationCard"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LocationCard_personId_key" ON "LocationCard"("personId");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationCard" ADD CONSTRAINT "LocationCard_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
