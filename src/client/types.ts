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

export type Login = {
  type: "login";
};

export type Dashboard = {
  type: "dashboard";
  props: DashboardProps;
};

export type AdminDashboard = {
  type: "adminDashboard";
  props: AdminDashboardProps;
};

export type ClientComponent = AdminDashboard | Dashboard | Login;
