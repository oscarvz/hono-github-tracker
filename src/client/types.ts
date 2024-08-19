export type ClientComponent = Dashboard | AdminDashboard;

export type DashboardProps = {
  latestStar?: string;
};

// TODO: Now for demonstration purposes; replace with schema data
export type AdminDashboardProps = {
  tableData: Array<{
    name: string;
    userHandle: number;
  }>;
};

export type Dashboard = {
  type: "dashboard";
  props: DashboardProps;
};

export type AdminDashboard = {
  type: "adminDashboard";
  props: AdminDashboardProps;
};

export function isDashboardProps(
  component: ClientComponent,
): component is Dashboard {
  return component.type === "dashboard";
}
