-- CreateTable
CREATE TABLE "public"."Report" (
    "id" SERIAL NOT NULL,
    "images" TEXT[],
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lat" TEXT NOT NULL,
    "lon" TEXT NOT NULL,
    "dangerDegree" TEXT NOT NULL,
    "dangerCount" INTEGER NOT NULL DEFAULT 0,
    "isDanger" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT '대기',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);
