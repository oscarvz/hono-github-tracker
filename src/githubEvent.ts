export interface GithubEvent {
  createdBy: number;
  timestamp?: Date;
  type: string;
  action: string | null;
  event_id?: number | null;
  repo: number;
}
