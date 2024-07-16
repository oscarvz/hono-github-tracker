import { Hono } from "hono";
import { createHonoMiddleware } from "@fiberplane/hono";
import { getUserInfo } from "./userHandler";

const app = new Hono();

app.use(createHonoMiddleware(app));

app.get("/", async (c) => {
	return c.text("Hello Hono!");
});

app.get("/user", async (c) => {
	try {
		const info = await getUserInfo("evanshortiss");
		console.log(info);
		return c.json(info);
	} catch (error) {
		console.error("Error fetching user info:", error);
		return c.json({ error: "Failed to fetch user info" }, 500);
	}
});

export default app;
