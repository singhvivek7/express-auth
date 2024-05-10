import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'email required'],
  },
  password: {
    type: String,
    required: [true, 'password required'],
  },
});

export const User = model('User', userSchema);
