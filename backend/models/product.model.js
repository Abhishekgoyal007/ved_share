import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			min: 0,
			required: true,
		},
		image: {
			type: String,
			required: [true, "Image is required"],
		},
		category: {
			type: String,
			required: true,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // <-- this should match your User model name
			required: true,
		},
		pdfUrl: {
			type: String,
			required: false,
		},
		isBookSwap: {
			type: Boolean,
			default: false,
		},
		tags: {
			type: [String],
			default: [],
			validate: {
				validator: function(v) {
					return v.length <= 7;
				},
				message: 'Maximum 7 tags allowed'
			}
		},
		swapOffers: [
			{
				offeredProductId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				userId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				status: {
					type: String,
					enum: ["pending", "accepted", "rejected"],
					default: "pending",
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{ timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
