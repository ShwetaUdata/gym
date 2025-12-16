# Self-Hosting Guide: PowerFit Gym Management System

## Project Structure

```
powerfit-gym/
├── frontend/          # React frontend (this Lovable project)
│   └── ...
├── backend/           # Express + SQLite backend
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── gym.db        # SQLite database (auto-created)
```

## Backend Setup

### 1. Create Backend Folder

```bash
mkdir backend
cd backend
npm init -y
```

### 2. Install Dependencies

```bash
npm install express cors sqlite3 sqlite node-cron nodemailer body-parser dotenv
```

### 3. Create .env file

```env
EMAIL_USER=usgymnasium2021@gmail.com
EMAIL_PASSWORD=fcqdgaybzccqtzjs
PORT=5000
DB_PATH=./gym.db
```

### 4. Create server.js

Copy the server code from `backend-server.js` file in this project.

### 5. Run Backend

```bash
node server.js
```

## Frontend Configuration

### Environment Variable

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:5000
```

For production, update this to your deployed backend URL.

### Build Frontend

```bash
npm run build
```

## Deployment Options

### Backend Deployment
- **Railway**: Easy Node.js deployment
- **Render**: Free tier available
- **DigitalOcean App Platform**
- **Heroku**
- **VPS**: Any Linux server with Node.js

### Frontend Deployment
- **Vercel**: Best for React apps
- **Netlify**: Easy static hosting
- **Any static hosting service**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/clients/register` | Register new client |
| GET | `/api/clients` | Get all clients |
| GET | `/api/clients/:clientId` | Get client by ID |
| POST | `/api/payments` | Record payment |
| GET | `/api/payments/:clientId` | Get payment history |
| POST | `/api/emails/send` | Send email |
| GET | `/api/emails/:clientId` | Get email history |
| GET | `/api/health` | Health check |

## Scheduled Jobs

The backend includes a cron job that runs at **12:02 AM daily** to send birthday emails automatically.

## Notes

1. The frontend currently stores data in localStorage for demo purposes
2. To use the Express backend, update `GymContext.tsx` to fetch from the API instead of localStorage
3. Make sure CORS is properly configured for your production domain
