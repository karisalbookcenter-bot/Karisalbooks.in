"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes.constants";

import { PageContainer } from "@/components/common/PageContainer";

import { WelcomeBanner } from "./WelcomeBanner";
import { StatCardGrid } from "./StatCardGrid";
import { QuickActions } from "./QuickActions";
import { RecentActivity } from "./RecentActivity";
import { SystemStatus } from "./SystemStatus";
import { DashboardSkeleton } from "./DashboardSkeleton";

import type { DashboardOverviewProps } from "@/features/admin/types/dashboard.types";

import { getDashboardStats } from "@/features/admin/services/dashboard.service";


export function DashboardOverview({
  user,
  loading,
  className,
}: DashboardOverviewProps) {
  const router = useRouter();


  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });


  const [statsLoading, setStatsLoading] = useState(true);



  useEffect(() => {

    async function loadStats() {

      try {

        const data = await getDashboardStats();

        setStats(data);

      } catch (error) {

        console.error(
          "DASHBOARD STATS ERROR:",
          error
        );

      } finally {

        setStatsLoading(false);

      }

    }


    loadStats();

  }, []);



  if (loading) {

    return (
      <PageContainer
        title="Dashboard"
        description="Overview of your store."
        className={className}
      >
        <DashboardSkeleton />
      </PageContainer>
    );

  }



  return (

    <PageContainer
      title="Dashboard"
      description="Overview of your store."
      className={className}
    >

      <div className="flex flex-col gap-6">


        <WelcomeBanner user={user} />


        <StatCardGrid
          stats={stats}
          loading={statsLoading}
        />


        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <QuickActions
            onAction={(actionId) => {
              if (actionId === "add-category") router.push(ROUTES.ADMIN_CATEGORIES);
              if (actionId === "add-subcategory") router.push(ROUTES.ADMIN_SUBCATEGORIES);
            }}
          />

          <SystemStatus />

        </div>


        <RecentActivity />


      </div>


    </PageContainer>

  );

}