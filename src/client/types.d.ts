import "@hono/react-renderer";

declare module "@hono/react-renderer" {
  interface Props {
    title?: string;
    clientProps: string;
  }
}
