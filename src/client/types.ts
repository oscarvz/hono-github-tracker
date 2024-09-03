import type { Repository } from "../db";
import type { RepositoriesWithEvents } from "../types";

export type DashboardProps = {
  repositories: Array<
    Repository & {
      latestStar?: string;
    }
  >;
};

export type AdminDashboardProps = {
  repositories: RepositoriesWithEvents;
  params?: {
    repoId?: number;
    activeTab?: string;
  };
};

export type Dashboard = {
  type: "dashboard";
  props: DashboardProps;
};

export type AdminDashboard = {
  type: "adminDashboard";
  props: AdminDashboardProps;
};

export type ClientComponent = Dashboard | AdminDashboard;
