import jwt from "jsonwebtoken";

export const getJwtToken = (res, userId) => {
  const token = jwt.sign({ userId}, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
  res.cookie("token",token, {
    secure:false,
    httpOnly: true,
    sameSite: "strict",
    maxAge:7* 24 * 60 * 60 * 1000,
  });
  return token
};
