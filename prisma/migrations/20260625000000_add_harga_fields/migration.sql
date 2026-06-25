-- AlterTable
ALTER TABLE "Stok" ADD COLUMN "harga" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "HistoryPenjualan" ADD COLUMN "harga_satuan" INTEGER NOT NULL DEFAULT 0;
