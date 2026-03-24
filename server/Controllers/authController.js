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

  const { email, password, phone, type , role} = req.body;

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
        role: role || "USER" 
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
const logout = async (req, res, next) => {
  try {
    // Clear the JWT token from the client side by sending a response
    // Note: JWT tokens are stateless, so logout is handled on the client side
    // by deleting the token from local storage/cookies
    
    res.status(StatusCodes.OK).json({
      success: true,
      msg: "Logout successful",
      token: null  // Client should clear this
    });
  } catch (error) {
    throw new AppError(
      "Logout failed",
      StatusCodes.INTERNAL_SERVER_ERROR,
      "LOGOUT_ERROR"
    );
  }
};
const updateProfile = async (req, res, next) => {
  const userId = req.user.id;

  // Get user with all details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      id: true, 
      type: true,
      phone: true,
      working_Time: true,
      individual: true,
      business: true
    }
  });

  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND, "USER_NOT_FOUND");
  }

  // Extract all possible fields from request
  const { 
    phone, 
    working_Time, 
    type,
    // Individual fields
    full_Name,
    nin,
    location,
    // Business fields
    business_Name,
    rc_Number,
    form,
    nif,
    nis,
    locations
  } = req.body;

  // ==========================================
  // UPDATE USER TABLE FIELDS
  // ==========================================
  const userUpdateData = {};

  if (phone !== undefined) {
    if (!/^\d{10}$/.test(phone)) {
      throw new AppError(
        "Phone must be exactly 10 digits",
        StatusCodes.BAD_REQUEST,
        "INVALID_PHONE"
      );
    }
    userUpdateData.phone = phone;
  }

  if (working_Time !== undefined) {
    if (!/^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/.test(working_Time)) {
      throw new AppError(
        "Working time format should be HH:MM-HH:MM (e.g., 9:00-17:00)",
        StatusCodes.BAD_REQUEST,
        "INVALID_WORKING_TIME"
      );
    }
    userUpdateData.working_Time = working_Time;
  }

  if (type !== undefined) {
    if (!["INDIVIDUAL", "BUSINESS"].includes(type)) {
      throw new AppError(
        "Type must be either INDIVIDUAL or BUSINESS",
        StatusCodes.BAD_REQUEST,
        "INVALID_TYPE"
      );
    }
    userUpdateData.type = type;
  }

  // ==========================================
  // UPDATE INDIVIDUAL TABLE FIELDS
  // ==========================================
  const individualUpdateData = {};

  if (full_Name !== undefined) {
    if (full_Name.trim().length < 2) {
      throw new AppError(
        "Full name must be at least 2 characters",
        StatusCodes.BAD_REQUEST,
        "INVALID_FULL_NAME"
      );
    }
    individualUpdateData.full_Name = full_Name;
  }

  if (nin !== undefined) {
    if (nin.trim().length < 5) {
      throw new AppError(
        "NIN must be at least 5 characters",
        StatusCodes.BAD_REQUEST,
        "INVALID_NIN"
      );
    }

    // Check if NIN already taken by another user
    const existingNin = await prisma.individual.findUnique({
      where: { nin: nin }
    });

    if (existingNin && existingNin.user_ID !== userId) {
      throw new AppError(
        "NIN already registered",
        StatusCodes.CONFLICT,
        "NIN_EXISTS"
      );
    }

    individualUpdateData.nin = nin;
  }

  if (location !== undefined) {
    if (location.trim().length < 2) {
      throw new AppError(
        "Location must be at least 2 characters",
        StatusCodes.BAD_REQUEST,
        "INVALID_LOCATION"
      );
    }
    individualUpdateData.location = location;
  }

  // ==========================================
  // UPDATE BUSINESS TABLE FIELDS
  // ==========================================
  const businessUpdateData = {};

  if (business_Name !== undefined) {
    if (business_Name.trim().length < 2) {
      throw new AppError(
        "Business name must be at least 2 characters",
        StatusCodes.BAD_REQUEST,
        "INVALID_BUSINESS_NAME"
      );
    }
    businessUpdateData.business_Name = business_Name;
  }

  if (rc_Number !== undefined) {
    // Check if RC number already taken
    const existingRc = await prisma.business.findUnique({
      where: { rc_Number: rc_Number }
    });

    if (existingRc && existingRc.user_ID !== userId) {
      throw new AppError(
        "RC number already registered",
        StatusCodes.CONFLICT,
        "RC_EXISTS"
      );
    }
    businessUpdateData.rc_Number = rc_Number;
  }

  if (form !== undefined) {
    if (form.trim().length < 2) {
      throw new AppError(
        "Form must be at least 2 characters",
        StatusCodes.BAD_REQUEST,
        "INVALID_FORM"
      );
    }
    businessUpdateData.form = form;
  }

  if (nif !== undefined) {
    if (typeof nif !== "number" || nif < 0) {
      throw new AppError(
        "NIF must be a positive number",
        StatusCodes.BAD_REQUEST,
        "INVALID_NIF"
      );
    }
    businessUpdateData.nif = nif;
  }

  if (nis !== undefined) {
    if (typeof nis !== "number" || nis < 0) {
      throw new AppError(
        "NIS must be a positive number",
        StatusCodes.BAD_REQUEST,
        "INVALID_NIS"
      );
    }
    businessUpdateData.nis = nis;
  }

  if (locations !== undefined) {
    if (!Array.isArray(locations) || locations.length === 0) {
      throw new AppError(
        "Locations must be a non-empty array",
        StatusCodes.BAD_REQUEST,
        "INVALID_LOCATIONS"
      );
    }
    businessUpdateData.locations = locations;
  }

  // ==========================================
  // CHECK IF THERE'S ANYTHING TO UPDATE
  // ==========================================
  const hasUserUpdates = Object.keys(userUpdateData).length > 0;
  const hasIndividualUpdates = Object.keys(individualUpdateData).length > 0;
  const hasBusinessUpdates = Object.keys(businessUpdateData).length > 0;

  if (!hasUserUpdates && !hasIndividualUpdates && !hasBusinessUpdates) {
    throw new AppError(
      "No fields to update",
      StatusCodes.BAD_REQUEST,
      "NO_UPDATES"
    );
  }

  // ==========================================
  // PERFORM UPDATES
  // ==========================================
  try {
    let updatedUser = null;
    let updatedIndividual = null;
    let updatedBusiness = null;

    // Update User table if there are changes
    if (hasUserUpdates) {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
        select: {
          id: true,
          email: true,
          phone: true,
          working_Time: true,
          type: true,
          role: true,
          status: true
        }
      });
    } else {
      // Get current user data if not updating
      updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          working_Time: true,
          type: true,
          role: true,
          status: true
        }
      });
    }

    // Update Individual if there are changes and user is INDIVIDUAL
    if (hasIndividualUpdates) {
      if (user.type !== "INDIVIDUAL") {
        throw new AppError(
          "This account is not an individual account",
          StatusCodes.BAD_REQUEST,
          "TYPE_MISMATCH"
        );
      }

      if (!user.individual) {
        throw new AppError(
          "Individual profile not found",
          StatusCodes.NOT_FOUND,
          "PROFILE_NOT_FOUND"
        );
      }

      updatedIndividual = await prisma.individual.update({
        where: { user_ID: userId },
        data: individualUpdateData
      });
    }

    // Update Business if there are changes and user is BUSINESS
    if (hasBusinessUpdates) {
      if (user.type !== "BUSINESS") {
        throw new AppError(
          "This account is not a business account",
          StatusCodes.BAD_REQUEST,
          "TYPE_MISMATCH"
        );
      }

      if (!user.business) {
        throw new AppError(
          "Business profile not found",
          StatusCodes.NOT_FOUND,
          "PROFILE_NOT_FOUND"
        );
      }

      updatedBusiness = await prisma.business.update({
        where: { user_ID: userId },
        data: businessUpdateData
      });
    }

    // Get complete updated data
    const completeUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        working_Time: true,
        type: true,
        role: true,
        status: true,
        individual: {
          select: {
            full_Name: true,
            nin: true,
            location: true
          }
        },
        business: {
          select: {
            business_Name: true,
            rc_Number: true,
            form: true,
            nif: true,
            nis: true,
            locations: true
          }
        }
      }
    });

    res.status(StatusCodes.OK).json({
      success: true,
      msg: "Profile updated successfully",
      user: completeUser
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new AppError(
        "Unique constraint violation",
        StatusCodes.CONFLICT,
        "DUPLICATE_VALUE"
      );
    }
    throw new AppError(
      error.message || "Failed to update profile",
      StatusCodes.INTERNAL_SERVER_ERROR,
      "UPDATE_FAILED"
    );
  }
};

module.exports = { register, login, IndividualProfile, BusinessProfile, logout , updateProfile };
