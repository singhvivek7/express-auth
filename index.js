import express from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { User } from './models/User.js';

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
    });
  }

  try {
    const hashedPass = bcrypt.hashSync(password, 12);

    const userData = await User.create({ email, password: hashedPass });

    const user = await userData.save();

    const jwtToken = jwt.sign({ id: user._id }, 'my-supper-secret-key', {
      expiresIn: '7d',
    });

    res.cookie('auth', jwtToken, { httpOnly: true }).json({
      user: {
        email: user.email,
        _id: user._id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: 'Email and password are not matched',
      });
    }

    const isMatched = bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(400).json({
        message: 'Email and password are not matched',
      });
    }

    const jwtToken = jwt.sign({ id: user._id }, 'my-supper-secret-key', {
      expiresIn: '7d',
    });

    return res
      .cookie('auth', jwtToken, { httpOnly: true })
      .status('200')
      .json({
        user: {
          email: user.email,
          _id: user._id,
        },
      });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
});

app.get('/test', (req, res) => {
  const token = req.cookies.auth;

  const data = jwt.verify(token, 'my-supper-secret-key');

  return res.json({
    message: 'token tested success',
    _id: data.id,
  });
});

connect('mongodb://localhost:27017/auth-express').then(() => {
  console.log('Connected MongoDB');
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
