import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();
   const JWT_SECRET = process.env.JWT_SECRET;
   
   if (!JWT_SECRET) {
     throw new Error('JWT_SECRET must be defined in environment variables');
   }
export const generateToken = (user) => {
  return jwt.sign(
    { 
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};