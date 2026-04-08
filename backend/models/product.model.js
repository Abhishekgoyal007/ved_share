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
		images: {
			front: {
				type: String,
				default: ""
			},
			back: {
				type: String,
				default: ""
			},
			left: {
				type: String,
				default: ""
			},
			right: {
				type: String,
				default: ""
			}
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
		sold: {
			type: Boolean,
			default: false,
		},
		serialNumber: {
			type: String,
			unique: true,
			sparse: true,
		},
	},
	{ timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
