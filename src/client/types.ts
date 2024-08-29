import type { Event, Repository } from "../db";

export type DashboardProps = {
  repositories: Array<
    Repository & {
      latestStar?: string;
    }
  >;
};

export type AdminDashboardProps = {
  repositories: Array<
    Repository & {
      events: Array<Event>;
    }
  >;
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
