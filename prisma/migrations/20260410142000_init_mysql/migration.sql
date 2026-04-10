CREATE TABLE `Settings` (
  `id` INTEGER NOT NULL DEFAULT 1,
  `childName` VARCHAR(191) NOT NULL,
  `spendPercentage` INTEGER NOT NULL,
  `savePercentage` INTEGER NOT NULL,
  `investPercentage` INTEGER NOT NULL,
  `givePercentage` INTEGER NOT NULL,
  `defaultLoanInterestRate` DOUBLE NOT NULL,
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `BucketBalance` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `bucket` VARCHAR(191) NOT NULL,
  `balance` DECIMAL(10, 2) NOT NULL,
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `BucketBalance_bucket_key` (`bucket`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Loan` (
  `id` VARCHAR(191) NOT NULL,
  `borrowerName` VARCHAR(191) NOT NULL,
  `principal` DECIMAL(10, 2) NOT NULL,
  `purpose` VARCHAR(191) NOT NULL,
  `annualInterestRate` DOUBLE NOT NULL,
  `borrowedAt` DATETIME(3) NOT NULL,
  `repaidAt` DATETIME(3) NULL,
  `status` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Chore` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `reward` DECIMAL(10, 2) NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `sortOrder` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Transaction` (
  `id` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `bucket` VARCHAR(191) NULL,
  `occurredAt` DATETIME(3) NOT NULL,
  `loanId` VARCHAR(191) NULL,
  `choreId` VARCHAR(191) NULL,
  `reflectionMonth` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `Transaction_occurredAt_idx` (`occurredAt`),
  INDEX `Transaction_type_occurredAt_idx` (`type`, `occurredAt`),
  INDEX `Transaction_bucket_occurredAt_idx` (`bucket`, `occurredAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ChoreCompletion` (
  `id` VARCHAR(191) NOT NULL,
  `choreId` VARCHAR(191) NOT NULL,
  `completedAt` DATETIME(3) NOT NULL,
  `approvedAt` DATETIME(3) NULL,
  `resultingTransactionId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `ChoreCompletion_resultingTransactionId_key` (`resultingTransactionId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Reflection` (
  `id` VARCHAR(191) NOT NULL,
  `transactionId` VARCHAR(191) NOT NULL,
  `monthKey` VARCHAR(191) NOT NULL,
  `verdict` VARCHAR(191) NOT NULL,
  `note` LONGTEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `Reflection_transactionId_key` (`transactionId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Tip` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `body` LONGTEXT NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Transaction`
  ADD CONSTRAINT `Transaction_loanId_fkey`
  FOREIGN KEY (`loanId`) REFERENCES `Loan`(`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE `ChoreCompletion`
  ADD CONSTRAINT `ChoreCompletion_choreId_fkey`
  FOREIGN KEY (`choreId`) REFERENCES `Chore`(`id`)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE `ChoreCompletion`
  ADD CONSTRAINT `ChoreCompletion_resultingTransactionId_fkey`
  FOREIGN KEY (`resultingTransactionId`) REFERENCES `Transaction`(`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
