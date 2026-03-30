const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const prisma = require("../config/prismaClient");
const AppError = require("../utils/AppError")
const { snedverificationemail } = require("../mailtrap/emails.js")

const register = async (req, res, next) => {
  
  // Validate incoming fields
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", StatusCodes.BAD_REQUEST, "VALIDATION_ERROR");
  }

  const { email, password, phone, type, role } = req.body;

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

  // Create verification token (6-digit random number) - generated server-side
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 24 hours
console.log("Generated verification token:", verificationToken); // Log the token for debugging
  // Save user in DB - try-catch for database-specific errors
  let user;
  try {
    user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        phone: phone,
        type: type,
        role: role || "USER",
        verificationToken: verificationToken,
        verificationTokenExpires: verificationTokenExpires
      }
    });
  } catch (error) {
      console.error("Full error object:", JSON.stringify(error, null, 2)); // ADD THIS
  console.error("Error message:", error.message);
  console.error("Error code:", error.code);
    if (error.code === "P2002") {
      throw new AppError("Email already exists in database", StatusCodes.CONFLICT, "DUPLICATE_EMAIL");
    }
    throw new AppError("Failed to create user", StatusCodes.INTERNAL_SERVER_ERROR, "USER_CREATION_ERROR");
   
  }

  // Send verification email AFTER user creation
  await snedverificationemail(email, verificationToken);

  // Sign JWT for login
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  res.status(StatusCodes.CREATED).json({ 
    success: true,
    msg: "Registration successful. Check your email to verify.", 
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
      token: null
    });
  } catch (error) {
    throw new AppError("Logout failed", StatusCodes.INTERNAL_SERVER_ERROR, "LOGOUT_ERROR"
    );
  }
};

const updateProfile = async (req,res,next) => {

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new AppError("Validation failed", StatusCodes.BAD_REQUEST, "VALIDATION_ERROR");
	}

	const { 
		user: {id, type, ...userData} = {},
		profile: {user_ID, ...profileData} = {}
	} = req.body

  if (id !== req.user.id) {
    throw new AppError("Not authorized to update this Profile", StatusCodes.FORBIDDEN, "FORBIDDEN")
  }
	
	const user = await prisma.user.findUnique({
		where: { id: id }
	})

  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND, "USER_NOT_FOUND")
	}

  if (user.type !== type) {
		throw new AppError("Type Mismatch", StatusCodes.BAD_REQUEST, "TYPE_MISMATCH")
	}
	
	const updateUser = await prisma.user.update({
		where: {id: id},
		data: userData
	})

	if (user.type === "INDIVIDUAL") {
		const indProfile = await prisma.individual.findUnique({
			where: {user_ID: id}
		})

		if (!indProfile) {
			throw new AppError("No Profile with this ID", StatusCodes.NOT_FOUND, "PROFILE_NOT_FOUND")
		}

		const updateProfile = await prisma.individual.update({
			where: {user_ID: id},
			data: profileData
		})
		res.status(StatusCodes.OK).json({
			msg: "Profile Data Updated Successfully", 
			data: {user: updateUser, profile: updateProfile}
		})
	}
	else if (user.type === "BUSINESS") {
		const busProfile = await prisma.business.findUnique({
			where: {user_ID: id}
		})

		if (!busProfile) {
			throw new AppError("No Profile with this ID", StatusCodes.NOT_FOUND, "PROFILE_NOT_FOUND")
		}

		const updateProfile = await prisma.business.update({
			where: {user_ID: id},
			data: profileData
		})
		res.status(StatusCodes.OK).json({
			msg: "Profile Data Updated Successfully", 
			data: {user: updateUser, profile: updateProfile}
		})
	}
}

const verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new AppError("Verification code is required", StatusCodes.BAD_REQUEST, "MISSING_CODE");
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: code,
        verificationTokenExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw new AppError("Invalid or expired verification code", StatusCodes.BAD_REQUEST, "INVALID_CODE");
    }

    const { id } = user;

    await prisma.user.update({
      where: { id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null
      }
    });

    res.status(StatusCodes.OK).json({
      success: true,
      msg: "Email verified successfully"
    });
  } catch (error) {
    throw error;
  }
};

module.exports = { register, login, IndividualProfile, BusinessProfile, logout, updateProfile, verifyEmail };