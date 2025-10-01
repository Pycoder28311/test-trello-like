/*
  Warnings:

  - Added the required column `position` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `ChecklistItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Column` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Card` ADD COLUMN `position` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ChecklistItem` ADD COLUMN `position` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Column` ADD COLUMN `position` INTEGER NOT NULL;
