require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
app.use(cors());
const PORT = process.env.PORT || 3000;
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
});

const authRouter = require('./Routes/auth');
const profileRouter = require('./Routes/profile');
const shipmentsRouter = require('./Routes/shipments');
const routeRouter = require('./Routes/routes');
const adminRouter = require('./Routes/admin');
const dashboardRouter = require('./Routes/dashboard');
const notificationsRouter = require('./Routes/notifications')
const subscriptionsRouter = require('./Routes/subscriptions')
const uploadsRouter = require('./Routes/uploads')

const errorHandler = require('./Middlewares/errorHandler');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/profile', profileRouter);
app.use('/api/shipments', shipmentsRouter);
app.use('/api/routes', routeRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter)
app.use('/api/subscriptions', subscriptionsRouter)
app.use('/api/uploads', uploadsRouter)

app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
