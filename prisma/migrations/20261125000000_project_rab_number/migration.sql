-- Nomor RAB dan nama penyetuju untuk kop & tanda tangan dokumen
ALTER TABLE `projects` ADD COLUMN `rab_number` VARCHAR(50) NULL AFTER `client_name`,
    ADD COLUMN `approved_by` VARCHAR(255) NULL AFTER `rab_number`;
