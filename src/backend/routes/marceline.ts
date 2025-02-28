import { FastifyInstance } from "fastify";
import { generateAccessToken, generateHash } from "../utils/hashPassword";
import type { ViteDevServer } from "vite";

export default async (fastify: FastifyInstance) => {

  fastify.marceline.addAuthMethod(async (req, reply) => {
    const { login, password } = req.body as any
    const user = await fastify.prisma.adminUser.findUnique({
      where: { login }
    })

    if (!user) return reply.code(403).send("Wrong credentials")

    const hash = await generateHash(password)
    if (!hash.equals(user.password)) return reply.code(403).send("Wrong credentials")

    if (!user.token) {
      const token = generateAccessToken()
      await fastify.prisma.adminUser.update({
        where: { id: user.id },
        data: { token }
      })
      user.token = token
    }

    return { accessToken: user.token }
  })

  // if (import.meta.env.DEV) {
  //   const { createServer } = await import("vite")

  //   const port = 5566
  //   const server: ViteDevServer = import.meta.hot?.data.server ?? await createServer({
  //     plugins: [  ],
  //     server: {
  //       port,
  //       proxy: {
  //         "/api": `http://localhost:${port}`
  //       }
  //     },
  //     build: {
  //       lib: {
  //         entry: "/src/dashboard/mount.ts"
  //       }
  //     },
  //   })

  //   if (!import.meta.hot?.data.server) {
  //     import.meta.hot!.data.server = server
      
  //     await server.listen()
  //   }
  //   fastify.marceline.registerScript(`http://localhost:${port}/src/dashboard/mount.ts`)
  // } else {
  //   fastify.marceline.registerScript(`/api/dashboard.js`)
  //   fastify.marceline.registerScript(`/api/dashboard.css`)
  // }

  // fastify.get("/dashboard.js", (req, reply) => {
  //   return reply.sendFile("dashboard.js", process.cwd() + "/dist")
  // })

  // fastify.get("/dashboard.css", (req, reply) => {
  //   return reply.sendFile("style.css", process.cwd() + "/dist")
  // })
}