import  express, { Request, Response } from 'express'
import { User } from '../models/user'
import { BadRequestError, validateRequest } from '@f2hard3-ticketing/common'
import { body } from 'express-validator'
import { PasswordManager } from '../services/password-manager'
import { sign } from 'jsonwebtoken'

const router = express.Router()

router.post('/api/users/signin', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('You must supply a password')
],
validateRequest,
async (req: Request, res: Response) => { 
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (!existingUser) throw new BadRequestError('Invalid credentials')

    const passwordMatch = await PasswordManager.compare(existingUser.password, password)
    if (!passwordMatch) throw new BadRequestError('Invalid credentials')

    const userJwt = sign({
        id: existingUser.id,
        email: existingUser.email,
    }, process.env.JWT_KEY!)
    req.session = { jwt: userJwt }

    res.status(200).send(existingUser)
})

export { router as signinRouter }