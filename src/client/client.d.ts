import "@hono/react-renderer";

import { ClientComponent } from "./types";

declare module "@hono/react-renderer" {
  interface Props {
    title?: string;
    clientComponent?: ClientComponent;
  }
}
