import crypto from 'crypto'
import { uid } from 'uid/secure'
import { promisify } from 'util'

export const generateHash = (pass: string): Promise<Buffer> => {
  return promisify(crypto.scrypt)(pass, "marceline", 32) as Promise<Buffer>
}

export const generateAccessToken = () => {
  return uid(40)
}