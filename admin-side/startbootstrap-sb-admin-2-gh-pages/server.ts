import express, { Request, Response, json } from 'express';
import cors from 'cors';
import { sign } from 'jsonwebtoken';
import multer from 'multer';

const server = express();
const upload = multer({ dest: './public/images' });

server.use(json());
server.use(cors({
    origin: '*'
}));

server.use(express.static('./public'));

server.post('/auth/login', (req: Request, res: Response) => {

    const clientEmail = req.body.email;
    const clientPassword = req.body.password;

    const email = 'server@gmail.com';
    const password = 'server123';

    if (clientEmail === email && clientPassword === password) {

        const access_token = sign({ clientEmail }, 'TOP_SECRET_KEY');
        const refresh_token = sign({ access_token }, 'TOP_SECRET_KEY');

        res.status(200).json({
            access_token,
            refresh_token
        });

        return;

    } else {
        res.status(400).json({
            message: 'Invalid email or password'
        });

        return;
    }

});

server.post('/images', upload.single('image'), (req: Request, res: Response) => {
    res.status(201).json({ url: `http://localhost:3001/images/${req.file?.filename}` });
});

server.listen(3001, () => {
    console.log('Server is runnong on PORT 3001');
});