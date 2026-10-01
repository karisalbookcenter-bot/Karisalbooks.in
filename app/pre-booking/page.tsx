import { MainLayout } from "@/components/layout/MainLayout";
import { PreBookingCatalog } from "@/features/pre-booking/components/PreBookingCatalog";

export default function PreBookingPage() {
  return (
    <MainLayout>
      <PreBookingCatalog />
    </MainLayout>
  );
}