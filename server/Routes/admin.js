const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const {
    listUsers,
    getUser,
    activateUser,
    suspendUser,
    getDashboardStats,
    exportUsersCSV,
    exportShipmentsCSV,
    exportRoutesCSV,
} = require('../Controllers/adminController');
const checkAdmin = require('../Middlewares/checkPermissions');
const checkToken = require('../Middlewares/checkToken');

// CRUD USERS
router.get('/users', checkToken, checkAdmin, asyncHandler(listUsers));
router.get('/users/:id', checkToken, checkAdmin, asyncHandler(getUser));
router.patch(
    '/users/:id/activate',
    checkToken,
    checkAdmin,
    asyncHandler(activateUser)
);
router.patch(
    '/users/:id/suspend',
    checkToken,
    checkAdmin,
    asyncHandler(suspendUser)
);

// Dashboard
router.get(
    '/Dashboard',
    checkToken,
    checkAdmin,
    asyncHandler(getDashboardStats)
);
router.get(
    '/users/export/csv',
    checkToken,
    checkAdmin,
    asyncHandler(exportUsersCSV)
);
router.get(
    '/shipments/export/csv',
    checkToken,
    checkAdmin,
    asyncHandler(exportShipmentsCSV)
);
router.get(
    '/routes/export/csv',
    checkToken,
    checkAdmin,
    asyncHandler(exportRoutesCSV)
);

module.exports = router;
