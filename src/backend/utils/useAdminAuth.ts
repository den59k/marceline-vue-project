import { onRequestAsyncHookHandler } from "fastify";


export const useAdminAuth: onRequestAsyncHookHandler = async function (req, reply) {

  const str = req.headers["authorization"]?.split(" ")
  if (!str || str.length !== 2 || str[0] !== "Bearer") return reply.code(403).send("Authorization required")
    
  const accessToken = str[1]
  if (!accessToken) return reply.code(403).send("Authorization required")

  const user = await this.prisma.adminUser.findUnique({
    select: { id: true },
    where: { token: accessToken }
  })

  if (!user) return reply.code(403).send("Wrong authorization token")
}