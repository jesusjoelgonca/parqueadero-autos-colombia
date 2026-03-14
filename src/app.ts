import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import routes from './routes';
import { attachUserFromJwt } from './middleware/jwtAuth';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(attachUserFromJwt);

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.get('/', (req, res) => {
  if (req.user) {
    res.redirect(req.user.rol === 'Administrador' ? '/usuarios' : '/estacionados');
    return;
  }
  res.redirect('/auth/login');
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
