import { HomePageContent } from "@/components/layout/HomePageContent";
import { getHomepageData } from "@/features/storefront/services/homepage-data.server";

export const revalidate = 300;

export default async function HomePage() {
  const initialData = await getHomepageData();

  return <HomePageContent initialData={initialData} />;
}
