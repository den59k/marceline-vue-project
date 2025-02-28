import fastify, { FastifyServerOptions } from "fastify";
import { marceline } from "marceline";
import fastifyStatic from '@fastify/static'
import { join } from "path";
import { SchemaItem, SchemaType } from "compact-json-schema";
import { useAdminAuth } from "./utils/useAdminAuth";

const plugins = import.meta.glob<any>('./plugins/**/*.ts', { eager: true })
const routes = import.meta.glob<any>('./routes/**/*.ts', { eager: true })

export const createApp = async (opts?: FastifyServerOptions) => {
  const app = fastify(opts)
  
  for (let plugin of Object.values(plugins)) {
    if (typeof plugin.default !== "function") continue
    await app.register(plugin)
  }

  app.addContentTypeParser("application/octet-stream", { bodyLimit: 1024 * 1024 * 5 }, (req, payload, done) => {
    const chunks: Buffer[] = []
    payload.on('data', chunk => {
      chunks.push(chunk)
    });
    payload.on('end', () => {
      done(null, Buffer.concat(chunks));
    });
    payload.on('error', err => {
      done(err);
    });
  })

  await app.register(marceline, {
    root: import.meta.env.DEV? undefined: "/admin/",
    title: "AdminPanel - Пермь",
    prisma: app.prisma,
    auth: {
      onRequest: useAdminAuth
    },
    files: {
      systemTable: "file",
      prefix: "/uploads/"
    }
  })

  await app.register(fastifyStatic, { prefix: "/uploads", root: join(process.cwd(), "uploads") })

  const routePrefix = "/api"
  for (let [ key, route ] of Object.entries(routes)) {
    if (typeof route.default !== "function") continue
    const path = key.slice("./routes/".length).split("/")
    const prefix = route.prefix ?? [ routePrefix, ...path.slice(0, -1) ].join("/")
    app.register(route, { prefix })
  }

  app.setNotFoundHandler(async (req, reply) => {
    return reply.code(404).send({ error: `Route ${req.method}:${req.url} not found` })
  })

  return app
}

declare module 'fastify' {
  interface FastifyTypeProviderDefault {
    validator: this['schema'] extends SchemaItem? SchemaType<this['schema']>: any,
    serializer: this['schema'] extends SchemaItem? SchemaType<this['schema']>: any,
  }
}
