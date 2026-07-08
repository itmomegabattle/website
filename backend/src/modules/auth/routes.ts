import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { env, isItmoIdConfigured } from "../../config/env.js";

const telegramVerifySchema = z.object({
  initData: z.string().min(1),
  source: z.enum(["participant_bot", "org_bot", "site"]).default("site"),
});

export async function authRoutes(app: FastifyInstance) {
  app.get("/auth/itmo/start", async (_request, reply) => {
    if (!isItmoIdConfigured) {
      return reply.code(501).send({
        error: "ITMO.ID is not configured yet",
        message: "Когда выдадут client_id/client_secret, этот endpoint начнёт редиректить в ITMO.ID.",
      });
    }

    const authUrl = new URL(`${env.ITMO_ID_ISSUER_URL}/protocol/openid-connect/auth`);
    authUrl.searchParams.set("client_id", env.ITMO_ID_CLIENT_ID!);
    authUrl.searchParams.set("redirect_uri", env.ITMO_ID_REDIRECT_URI!);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid profile email");

    return reply.redirect(authUrl.toString());
  });

  app.get("/auth/itmo/callback", async (request, reply) => {
    const query = request.query as { code?: string; error?: string };

    if (query.error) {
      return reply.redirect(`${env.PUBLIC_SITE_URL}/auth?itmo_error=${encodeURIComponent(query.error)}`);
    }

    if (!query.code) {
      return reply.code(400).send({ error: "Missing ITMO.ID authorization code" });
    }

    return reply.code(501).send({
      error: "ITMO.ID token exchange is not implemented yet",
      next: "После выдачи доступов добавляем обмен code на token и привязку identity к профилю.",
    });
  });

  app.post("/auth/telegram/verify", async (request, reply) => {
    const parsed = telegramVerifySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid Telegram auth payload", details: parsed.error.flatten() });
    }

    return reply.code(501).send({
      error: "Telegram Mini App verification is not implemented yet",
      next: "Нужно добавить HMAC-проверку initData и связку telegram_user_id с profiles.",
      source: parsed.data.source,
    });
  });

  app.post("/auth/logout", async () => ({
    ok: true,
    message: "Stateless logout placeholder. Cookie/session cleanup will be added with auth implementation.",
  }));
}
