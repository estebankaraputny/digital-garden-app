/*
  Warnings:

  - Added the required column `updatedAt` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Note_slug_idx` ON `note`;

-- AlterTable
ALTER TABLE `note` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
