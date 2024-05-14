import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { sign } from 'jsonwebtoken'

declare global {
    var getCookie: (id?: string) => string[]
}

global.getCookie = (id) => {
    const payload = {
        id: id ?? new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }
    const token = sign(payload, process.env.JWT_KEY!)
    const session = { jwt: token }
    const sessionJSON = JSON.stringify(session)
    const base64 = Buffer.from(sessionJSON).toString('base64')
    return [`session=${base64}`]
}

jest.mock('../rabbitmq-wrapper')

/* cspell: disable-next-line */
process.env.STRIPE_KEY = 'sk_test_51PFm0fRonL08HkEZcAQyV9cYL14pU3mxZyFUF9hShwdqXfBTbkquF02gRbQMWVUe7m2kaNrzjvgTLGZxo3wVl5sf00lQGZcFpj'

let mongo: MongoMemoryServer
beforeAll(async () => {
    process.env.JWT_KEY = 'asdf'

    mongo = await MongoMemoryServer.create()
    const mongoUri = mongo.getUri()
    await mongoose.connect(mongoUri)
})

beforeEach(async () => {
    jest.clearAllMocks()
    const collections  = await mongoose.connection.db.collections()
    collections.forEach(async collection => {
        await collection.deleteMany({})
    })
})

afterAll(async () => {
    if (mongo) await mongo.stop()
    await mongoose.connection.close()
})
