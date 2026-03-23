const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const prisma = require("../config/prismaClient");
const AppError = require("../utils/AppError")


const register = async (req, res, next) => {
  
  // Validate incoming fields
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", StatusCodes.BAD_REQUEST, "VALIDATION_ERROR");
  }

  const { email, password, phone, type } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
    select: { id: true }
  });

  if(existingUser) {
    throw new AppError("User with this email already exists", StatusCodes.CONFLICT, "USER_EXISTS");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user in DB - try-catch for database-specific errors
  let user;
  try {
    user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        phone: phone,
        type: type,
        role: "USER"
      }
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new AppError("Email already exists in database", StatusCodes.CONFLICT, "DUPLICATE_EMAIL");
    }
    throw new AppError("Failed to create user", StatusCodes.INTERNAL_SERVER_ERROR, "USER_CREATION_ERROR");
  }

  // Sign JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  res.status(StatusCodes.CREATED).json({ 
    success: true,
    msg: "Registration successful", 
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      type: user.type,
      role: user.role
    }
  });
};


const login = async (req, res, next) => {

  const { email, password } = req.body;

  // Find user in DB
  const user = await prisma.user.findUnique({
    where: { email: email },
    select: {
      id: true,
      email: true,
      password: true,
      phone: true,
      type: true,
      role: true
    }
  });

  if(!user) {
    throw new AppError("No account found with this email", StatusCodes.NOT_FOUND, "USER_NOT_FOUND");
  }

  // Compare password
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED, "WRONG_PASSWORD");
  }

  // Sign JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  res.status(StatusCodes.OK).json({ 
    success: true,
    msg: `Welcome back, ${user.email}`, 
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      type: user.type,
      role: user.role
    }
  });
};

const IndividualProfile = async (req, res, next) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", StatusCodes.BAD_REQUEST, "VALIDATION_ERROR");
  }

  const userId = req.user.id;
  const { full_Name, nin, location } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, type: true }
  });

  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND, "USER_NOT_FOUND");
  }

  if (user.type !== "INDIVIDUAL") {
    throw new AppError("This account is not an individual account", StatusCodes.BAD_REQUEST, "TYPE_MISMATCH");
  }

  const existing = await prisma.individual.findUnique({
    where: { user_ID: userId },
    select: { user_ID: true }
  });

  if (existing) {
    throw new AppError("Individual profile already exists", StatusCodes.CONFLICT, "PROFILE_EXISTS");
  }

  const profile = await prisma.individual.create({
    data: {
      user_ID: userId,
      full_Name,
      nin,
      location
    }
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    msg: "Individual profile created successfully",
    data: profile
  });
};

const BusinessProfile = async (req, res, next) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", StatusCodes.BAD_REQUEST, "VALIDATION_ERROR");
  }

  const userId = req.user.id;
  const { business_Name, rc_Number, form, nif, nis, locations } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, type: true }
  });

  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND, "USER_NOT_FOUND");
  }

  if (user.type !== "BUSINESS") {
    throw new AppError("This account is not a business account", StatusCodes.BAD_REQUEST, "TYPE_MISMATCH");
  }

  const existing = await prisma.business.findUnique({
    where: { user_ID: userId },
    select: { user_ID: true }
  });

  if (existing) {
    throw new AppError("Business profile already exists", StatusCodes.CONFLICT, "PROFILE_EXISTS");
  }

  const profile = await prisma.business.create({
    data: {
      user_ID: userId,
      business_Name,
      rc_Number,
      form,
      nif,
      nis,
      locations
    }
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    msg: "Business profile created successfully",
    data: profile
  });
};


module.exports = { register, login, IndividualProfile, BusinessProfile};
