import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import path from 'path';
import routes from './routes';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

declare module 'express-session' {
  interface SessionData {
    user?: { userId: number; nombre: string; rol: string };
  }
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'clave-secreta-cambiar',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session?.user;
  next();
});

app.get('/', (req, res) => {
  if (req.session?.user) {
    res.redirect('/estacionados');
    return;
  }
  res.redirect('/auth/login');
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
