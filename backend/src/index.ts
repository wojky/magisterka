import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { jwt, sign, verify } from "hono/jwt";
import { users } from "./db-mock";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

export function setExpirationTime() {
  return new Date().getTime() + 1000 * 12000;
}

export function createUserDTO(id: string) {
  const { password, ...user } = users[id];

  return user;
}

const app = new Hono();

const JWT_PRIVATE_KEY = "privatekey";

app.use(cors());
app.use(
  "/watchlists",
  jwt({
    secret: JWT_PRIVATE_KEY,
  })
);

app.post("/watchlists", (c) => {
  return c.text("watchlists");
});

app.post("/verify", async (c) => {
  const { token } = await c.req.json();

  try {
    const jwtData = await verify(token, JWT_PRIVATE_KEY);
    console.log({ jwtData });
    const isExpired = jwtData.exp < new Date().getTime();

    if (isExpired) {
      return c.json(null);
    } else {
      const expiredAt = setExpirationTime();
      const signed = await sign(
        {
          payload: { user: createUserDTO(jwtData.payload.user.email) },
          exp: expiredAt,
        },
        JWT_PRIVATE_KEY
      );

      return c.json({
        token: signed,
        user: createUserDTO(jwtData.payload.user.email),
      });
    }
  } catch (e) {
    console.log({ e });
    c.status(401);

    return c.json({
      code: 400,
      ok: false,
      message: "Token expired",
    });
  }
});

app.post("/auth/logout", (c) => {
  return c.json(null);
});

app.post("/auth/login", async (c) => {
  const body = await c.req.json();

  if (users[body.email]?.password !== body.password) {
    c.status(400);

    return c.json({
      code: 400,
      ok: false,
      message: "Bad Credentials",
    });
  }

  const expiredAt = setExpirationTime();
  const signed = await sign(
    { payload: { user: users[body.email] }, exp: expiredAt },
    JWT_PRIVATE_KEY
  );

  return c.json({ token: signed, user: createUserDTO(body.email) });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
