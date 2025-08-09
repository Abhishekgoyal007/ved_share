import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendOTPEmail, sendPasswordResetEmail } from "../lib/emailSender.js";
import bcrypt from "bcryptjs";

const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
	await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
};

const setCookies = (res, accessToken, refreshToken) => {
	res.cookie("accessToken", accessToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 15 * 60 * 1000, // 15 minutes
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});
};

export const signup = async (req, res) => {
	const { email, password, name } = req.body;
	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}
		const user = await User.create({ name, email, password });

		const { otp } = user.generateOTP();
    await user.save(); // This triggers the pre-save hook

    // 4. Send OTP email
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "OTP sent to email",
      email: user.email
    });

		
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    
    // 1. Check OTP validity
    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      console.log("Invalid/expired OTP");
      return res.status(400).json({ error: "Invalid/expired OTP" });
    }

    // 2. Mark as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // authenticate
		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
      isVerified: true
		});

  } catch (error) {
    console.log("OTP verification failed:", error);
    res.status(500).json({ error: "Server error during verification" });
  }
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Generate new OTP (using your model method)
    const { otp } = user.generateOTP(); // This updates user.otp and user.otpExpiry
    await user.save();

    // 3. Send email
    await sendOTPEmail(email, otp);

    res.json({ 
      message: "New OTP sent",
      email: user.email
    });

  } catch (error) {
    console.log("Resend OTP failed:", error);
    res.status(500).json({ 
      error: "Failed to resend OTP",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (user && (await user.comparePassword(password))) {
			const { accessToken, refreshToken } = generateTokens(user._id);
			await storeRefreshToken(user._id, refreshToken);
			setCookies(res, accessToken, refreshToken);

			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			});
		} else {
			res.status(400).json({ message: "Invalid email or password" });
		}
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			await redis.del(`refresh_token:${decoded.userId}`);
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

		if (storedToken !== refreshToken) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}

		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Forgot Password

const generateResetToken = async () => {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const salt = await bcrypt.genSalt(10);
  return {
    plainToken: token,
    hashedToken: await bcrypt.hash(token, salt)
  };
};
export const forgotPassword = async (req, res) => {

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "If email exists, reset link will be sent" });
    }

    // Generate and save token
    const { plainToken, hashedToken } = await generateResetToken();
		console.log("plain token:", plainToken)
    user.resetPasswordToken = hashedToken;
		console.log("hashed token: ", hashedToken);
    user.resetPasswordExpiresAt = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with plain token (not the hashed one)
    await sendPasswordResetEmail(email, plainToken);

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process password reset" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
	console.log("Received token:", token);
	console.log("Request body:", req.body);
  const { newPassword } = req.body;

  try {
    // Find all users with an unexpired token
    const candidates = await User.find({
      resetPasswordToken: { $exists: true },
      resetPasswordExpiresAt: { $gt: Date.now() }
    });

		console.log("Found candidates:", candidates.length);

		// Compare each user's hashed token
    let matchedUser = null;
    for (const user of candidates) {
      const isValid = await bcrypt.compare(token, user.resetPasswordToken);
      if (isValid) {
        matchedUser = user;
        break;
      }
    }

		console.log("Matched user:", matchedUser);
		console.log("hashedToken", matchedUser.resetPasswordToken);

		
// Step 3: If no user matched
    if (!matchedUser) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Step 4: Reset password
    matchedUser.password = newPassword;
    matchedUser.resetPasswordToken = undefined;
    matchedUser.resetPasswordExpiresAt = undefined;
    await matchedUser.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log("Password reset error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

