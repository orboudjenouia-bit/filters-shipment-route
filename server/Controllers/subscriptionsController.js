const prisma = require('../config/prismaClient');
const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const { StatusCodes } = require('http-status-codes');
const createNotifs = require('../utils/createNotifs');

const isAdminUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { role: true },
    });

    return user?.role === 'ADMIN';
};

const listSubscriptions = async (req,res,next) => {

    const subs = await prisma.subscription.findMany()
    const total = await prisma.subscription.count()
    res.status(StatusCodes.OK).json({ subs, total})

}

const getMySub = async (req,res,next) => {

    const id = req.user.id
    const sub = await prisma.subscription.findUnique({
        where: { user_ID: id }
    })

    res.status(StatusCodes.OK).json(sub)
}

const newSub = async (req,res,next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation Failed', StatusCodes.BAD_REQUEST,'VALIDATION_ERROR');
    }

    const id = req.user.id
    const existingSub = await prisma.subscription.findUnique({
        where: { user_ID: id }
    })

    if (existingSub) {
        throw new AppError('Subscription already exists for this user', StatusCodes.CONFLICT, 'SUBSCRIPTION_EXISTS')
    }

    const sub = { 
        user_ID: id,
        ...req.body }

    const newSub = await prisma.subscription.create({
        data: sub
    })

    await createNotifs(
        id,
        'Subscription Made Successfully',
        `Subscription ${newSub.sub_ID} You've made is activated Successfully`,
        'account',
        undefined,
        undefined
    )

    res.status(StatusCodes.CREATED).json(newSub);
    
}

const updateSub = async (req,res,next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation Failed', StatusCodes.BAD_REQUEST,'VALIDATION_ERROR');
    }

    const id = req.user.id
    const isAdmin = await isAdminUser(id)
    const sub_ID = parseInt(req.params.id)
    const { ...sub } = req.body
    
    const oldSub = await prisma.subscription.findUnique({
        where: { sub_ID }
    })

    if (!oldSub) {
        throw new AppError("This Subscription doesn't Exists", StatusCodes.NOT_FOUND, "SUBSCRIPTION_NOT_FOUND")
    }

    if (oldSub.user_ID != id && !isAdmin) {
        throw new AppError("You're not authorized to update this Subscription", StatusCodes.FORBIDDEN, "NO_AUTHORIZATION")
    }

    const updateSub = await prisma.subscription.update({
        where: { sub_ID},
        data: sub
    })
    await createNotifs(
        id,
        'Subscription Updated',
        `Subscription ${sub_ID} Updated Successfully`,
        'account',
        undefined, undefined
    )

    res.status(StatusCodes.OK).json(updateSub)
}

const deleteSub = async (req,res,next) => {

    const id = req.user.id
    const isAdmin = await isAdminUser(id)
    const sub_ID = parseInt(req.params.id)

    const sub = await prisma.subscription.findUnique({
        where: { sub_ID }
    })

    if (!sub || sub.user_ID != id && !isAdmin) {
        throw new AppError('Not authorized to delete this subscription', StatusCodes.FORBIDDEN, 'FORBIDDEN');
    }

    const deletedSub = await prisma.subscription.delete({
        where: { sub_ID }
    })

    await createNotifs(
        id,
        'Subscription Deleted',
        `Subscription ${sub_ID} Deleted Successfully`,
        'account',
        undefined, undefined
    )

    res.status(StatusCodes.OK).json({msg: "Subscription deleted Successfully"})

}

const viewSub = async (req,res,next) => {

    const id = req.user.id
    const isAdmin = await isAdminUser(id)
    const sub_ID = parseInt(req.params.id)
    
    const sub = await prisma.subscription.findUnique({
        where: { sub_ID}
    })

    if (!sub || sub.user_ID != id && !isAdmin) {
        throw new AppError('Not authorized to View this subscription', StatusCodes.FORBIDDEN, 'FORBIDDEN')
    }
    res.status(StatusCodes.OK).json(sub)

}

module.exports = { listSubscriptions, getMySub, newSub, updateSub, deleteSub, viewSub}