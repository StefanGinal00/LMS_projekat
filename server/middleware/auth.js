import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Niste prijavljeni' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tajni_kljuc');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Nevažeći token' });
  }
};

export default auth;