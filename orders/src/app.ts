import express from 'express'
import { json } from 'body-parser'
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { NotFoundError, currentUser, errorHandler } from '@f2hard3-ticketing/common'
import { indexOrderRouter } from './routes';
import { deleteOrderRouter } from './routes/delete';
import { showOrderRouter } from './routes/show';
import { newOrderRouter } from './routes/new';


const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))
app.use(currentUser)

app.use(indexOrderRouter)
app.use(newOrderRouter)
app.use(showOrderRouter)
app.use(deleteOrderRouter)


app.all('*',  () => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app }