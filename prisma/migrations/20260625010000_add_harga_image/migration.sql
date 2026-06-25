-- CreateTable
CREATE TABLE "HargaImage" (
    "id" SERIAL NOT NULL,
    "produk_id" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HargaImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HargaImage" ADD CONSTRAINT "HargaImage_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "Produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
