import express, { Request, Response } from 'express';
import cors from 'cors';
import { sign } from 'jsonwebtoken';
import multer from 'multer';
import axios from 'axios'; 

const server = express();
const upload = multer({ dest: './public/images' });

interface Admin {
    email: string;
    password: string;
}
interface User {
    email: string;
    password: string;
}

async function fetchAdminData(): Promise<Admin[]> {
    try {
        const response = await axios.get('http://localhost:3000/admin');
        return response.data as Admin[];
    } catch (error) {
        throw error;
    }
}
async function fetchUserData(): Promise<User[]> {
    try {
        const response = await axios.get('http://localhost:3000/users');
        return response.data as User[];
    } catch (error) {
        throw error;
    }
}

server.use(express.json());
server.use(cors());

server.use(express.static('./public'));


server.post('/images', upload.single('image'), (req: Request, res: Response) => {
    res.status(201).json({ url: `http://localhost:3001/images/${req.file?.filename}` });
});

server.post('/auth/admin', async (req: Request, res: Response) => {
    const clientEmail = req.body.email;
    const clientPassword = req.body.password;

    try {
        const adminData = await fetchAdminData();
        console.log('Admin data:', adminData);

        const matchedAdmin = adminData.find((admin) => admin.email === clientEmail && admin.password === clientPassword);

        if (matchedAdmin) {
            console.log('Login successful for:', clientEmail);
            const access_token = sign({ clientEmail }, 'TOP_SECRET_KEY');
            const refresh_token = sign({ access_token }, 'TOP_SECRET_KEY');

            res.status(200).json({
                access_token,
                refresh_token
            });
        } else {
            console.log('Invalid login for:', clientEmail);
            res.status(400).json({
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        console.error('Error fetching admin data:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});
server.post('/auth/user', async (req: Request, res: Response) => {
    const clientEmail = req.body.email;
    const clientPassword = req.body.password;

    try {
        const userData = await fetchUserData();
        console.log('User data:', userData);

        const matchedUser = userData.find((user) => user.email === clientEmail && user.password === clientPassword);

        if (matchedUser) {
            console.log('Login successful for:', clientEmail);
            const access_token = sign({ clientEmail }, 'TOP_SECRET_KEY');
            const refresh_token = sign({ access_token }, 'TOP_SECRET_KEY');
            const user_data = matchedUser;

            res.status(200).json({
                access_token,
                refresh_token,
                user_data

            });
        } else {
            console.log('Invalid login for:', clientEmail);
            res.status(400).json({
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        console.error('Error fetching admin data:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

server.listen(3001, () => {
    console.log('Server is running on PORT 3001');
});
