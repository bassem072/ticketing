import jwt from 'jsonwebtoken';
import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { ValidationRequest, BadRequestError } from '@bastickets/common';
import { User } from '../models/user';
import { Password } from '../services/passwords';

const router = Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 8, max: 20 })
      .withMessage('Password must supply a password'),
  ],
  ValidationRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError('Bad credentials');
    }

    const passwordMatch = await Password.compare(
      existingUser.password,
      password
    );

    if (!passwordMatch) {
      throw new BadRequestError('Bad credentials');
    }

    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    return res.status(200).json(existingUser);
  }
);

export { router as signinRouter };
