export interface User {
    gitHub_id: number;
    gitHub_handle: string;
    gitHub_avatar: string;
    name: string | null;
    company?: string | null;
    location?: string | null;
    email?: string | null;
    bio?: string| null;
    twitter_handle?: string| null
  }