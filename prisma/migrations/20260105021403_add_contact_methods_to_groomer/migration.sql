-- AlterTable
ALTER TABLE "Groomer" ADD COLUMN     "contactMethods" TEXT[] DEFAULT ARRAY['call', 'sms']::TEXT[];
