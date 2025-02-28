import { FastifyInstance } from 'fastify'

export default async (fastify: FastifyInstance) => {

  fastify.get("/", () => {
    return { status: "up" }
  })

}