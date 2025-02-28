import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export default fp(async (fastify: FastifyInstance) => {
  // It is fast reply error 
  fastify.setErrorHandler((error, _request, reply) => {
    if (error.code === "P2002") {
      reply.code(409).send({ error: "Value already exists" })
      return
    }
    if (error instanceof HTTPError) {
      reply.code(error.statusCode).send({ error: error.body })
      return
    }

    if (error.code === 'P2025') {
      return reply.code(404).send({ error: `${(error as any)?.meta?.modelName ?? 'Item'} not found` })
    }

    if (error.validation) {
      const _error: Record<string, { code?: string, message?: string, params?: any }> = {}
      let counter = 0
      for (let field of error.validation) {
        if (typeof field.params.missingProperty === "string") {
          _error[field.params.missingProperty] = { code: "required", message: `Field "${field.params.missingProperty}" is required` }
          counter++
        }
        if (field.keyword === "minLength") {
          _error[field.instancePath.slice(1)] = { code: "minLength", message: field.message, params: field.params }
          counter++
        }
      }
      if (counter === 0) {
        console.error(error)
        _error["unknown"] = { message: error.validation[0].message ?? "Validation error", code: "validationError" }
      }
      reply.code(400).send({ error: _error })
      return
    }

    console.error(error)
    reply.code(500).send({ error: "Server error" })
	})
}, { name: 'error' })

export class HTTPError extends Error {
  body: any
  statusCode: number

  constructor(body: Record<string, { code?: string, message: string }> | string, statusCode: number = 400) {
    super()
    this.body = body
    this.statusCode = statusCode
  }
}