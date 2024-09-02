import type { Event, Repository, User } from "../db";

export type DashboardProps = {
  repositories: Array<
    Repository & {
      latestStar?: string;
    }
  >;
};

export type AdminDashboardProps = {
  repositories: Array<
    Pick<Repository, "id" | "fullName"> & {
      events: Array<Event>;
      users: Array<User>;
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
