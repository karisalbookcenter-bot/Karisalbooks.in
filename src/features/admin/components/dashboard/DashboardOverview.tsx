"use client";

import { useEffect, useState } from "react";

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



       export interface DashboardStats {
  totalBooks: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
}

export interface StatCardGridProps {
  cards?: StatCardDefinition[];
  stats?: DashboardStats;
  loading?: boolean;
  className?: string;
}


        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">


          <QuickActions />


          <SystemStatus />


        </div>



        <RecentActivity />


      </div>


    </PageContainer>

  );

}
