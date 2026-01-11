import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: function () {
				// Password not required if user signed up with Google
				return !this.googleUID;
			},
			minlength: [6, "Password must be at least 6 characters long"],
		},
		googleUID: {
			type: String,
			sparse: true, // Allow null/undefined values
		},
		profilePicture: {
			type: String,
		},
		cartItems: [
			{
				quantity: {
					type: Number,
					default: 1,
				},
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
				},
			},
		],
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		lastLogin: {
			type: Date,
			default: Date.now,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		otp: String,
		otpExpiresAt: Date,
	},
	{
		timestamps: true,
	}
);

// Pre-save hook to hash password before saving to database
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

userSchema.methods.createPasswordResetToken = async function () {
	const { plainToken, hashedToken } = await generateResetToken();
	this.resetPasswordToken = hashedToken;
	this.resetPasswordExpire = Date.now() + 3600000; // 1 hour
	return plainToken;
};

userSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

userSchema.methods.generateOTP = function () {
	const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
	const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

	this.otp = otp;
	this.otpExpiry = otpExpiry;

	return { otp, otpExpiry }; // Return for immediate use
};

const User = mongoose.model("User", userSchema);

export default User;
