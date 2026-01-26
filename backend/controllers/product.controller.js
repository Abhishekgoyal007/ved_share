import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
	try {
		// Exclude sold products from public view
		const products = await Product.find({ sold: false }).populate('userId', 'name email');
		res.json({ products });
	} catch (error) {
		console.log("Error in getAllProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProductById = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id).populate('userId', 'name email');
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}
		res.json(product);
	} catch (error) {
		console.log("Error in getProductById controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getMyProducts = async (req, res) => {
	try {
		const userId = req.user._id;
		const products = await Product.find({ userId });

		// Add pending offers count to each product
		const productsWithCounts = products.map(product => {
			const productObj = product.toObject();
			productObj.pendingOffersCount = product.swapOffers.filter(offer => offer.status === 'pending').length;
			return productObj;
		});

		res.json({ products: productsWithCounts });
	} catch (error) {
		console.error("Error fetching user products:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

export const getPendingOffersCount = async (req, res) => {
	try {
		const userId = req.user._id;
		const products = await Product.find({ userId });

		let totalPendingOffers = 0;
		products.forEach(product => {
			if (product.isBookSwap && product.swapOffers) {
				totalPendingOffers += product.swapOffers.filter(offer => offer.status === 'pending').length;
			}
		});

		res.json({ count: totalPendingOffers });
	} catch (error) {
		console.error("Error fetching pending offers count:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

export const getFeaturedProducts = async (req, res) => {
	try {
		let featuredProducts = await redis.get("featured_products");
		if (featuredProducts) {
			return res.json(JSON.parse(featuredProducts));
		}

		// if not in redis, fetch from mongodb
		// .lean() is gonna return a plain javascript object instead of a mongodb document
		// which is good for performance
		featuredProducts = await Product.find({ isFeatured: true }).lean();

		if (!featuredProducts) {
			return res.status(404).json({ message: "No featured products found" });
		}

		// store in redis for future quick access

		await redis.set("featured_products", JSON.stringify(featuredProducts));

		res.json(featuredProducts);
	} catch (error) {
		console.log("Error in getFeaturedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const createProduct = async (req, res) => {
	try {
		const { name, description, price, image, category, pdf, isBookSwap, tags, images } = req.body;

		// Validate required fields
		if (!name || !description || !category) {
			return res.status(400).json({ error: "Product name, description, and category are required" });
		}

		if (!image) {
			return res.status(400).json({ error: "Product image is required" });
		}

		let cloudinaryResponse = null;
		let cloudinaryPdfResponse = null;
		let angleImages = {};

		// ---- IMAGE UPLOAD (PUBLIC) ----
		if (image) {
			cloudinaryResponse = await cloudinary.uploader.upload(image, {
				upload_preset: "jrjc35xt",   // UNSIGNED → PUBLIC
				folder: "products",
				type: "upload"
			});
		}

		// ---- ANGLE IMAGES UPLOAD (PUBLIC) ----
		if (images && typeof images === 'object') {
			const angles = ['front', 'back', 'left', 'right'];
			for (const angle of angles) {
				if (images[angle]) {
					try {
						const response = await cloudinary.uploader.upload(images[angle], {
							upload_preset: "jrjc35xt",
							folder: `products/angles`,
							type: "upload"
						});
						angleImages[angle] = response.secure_url;
					} catch (error) {
						console.log(`Error uploading ${angle} image:`, error.message);
					}
				}
			}
		}

		// ---- PDF UPLOAD (PUBLIC) ----
		if (pdf) {
			cloudinaryPdfResponse = await cloudinary.uploader.upload(pdf, {
				upload_preset: "jrjc35xt",   // UNSIGNED → PUBLIC
				folder: "products_pdfs",
				resource_type: "raw",        // IMPORTANT for PDFs
				type: "upload"
			});
		}

		// ---- PROCESS TAGS (max 7, trimmed, lowercase) ----
		let processedTags = [];
		if (tags && Array.isArray(tags)) {
			processedTags = tags
				.slice(0, 7)
				.map(tag => tag.trim().toLowerCase())
				.filter(tag => tag.length > 0);
		}

		// Generate serial number (timestamp + random string)
		const serialNumber = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

		// ---- CREATE PRODUCT ----
		const product = await Product.create({
			name,
			description,
			price,
			image: cloudinaryResponse?.secure_url || "",
			images: angleImages,
			pdfUrl: cloudinaryPdfResponse?.secure_url || "",
			category,
			isBookSwap: isBookSwap || false,
			tags: processedTags,
			serialNumber,
			userId: req.user._id,
		});

		res.status(201).json(product);
	} catch (error) {
		console.log("Error in createProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const searchProducts = async (req, res) => {
	try {
		const { q } = req.query;

		if (!q || q.trim().length === 0) {
			return res.json({ products: [] });
		}

		const searchQuery = q.trim().toLowerCase();
		const searchTerms = searchQuery.split(/\s+/).filter(term => term.length > 0);

		// Build search conditions for each term
		const searchConditions = searchTerms.map(term => ({
			$or: [
				{ name: { $regex: term, $options: 'i' } },
				{ description: { $regex: term, $options: 'i' } },
				{ tags: { $regex: term, $options: 'i' } },
				{ category: { $regex: term, $options: 'i' } }
			]
		}));

		// Products must match ALL search terms (AND condition) and not be sold
		const products = await Product.find({
			$and: [...searchConditions, { sold: false }]
		}).populate('userId', 'name email').limit(50);

		res.json({ products });
	} catch (error) {
		console.log("Error in searchProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};


export const deleteProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		const isAdmin = req.user.role === "admin";
		const isOwner = product.userId.toString() === req.user._id.toString();

		if (!isAdmin && !isOwner) {
			return res.status(403).json({ message: "Access denied - You cannot delete this product" });
		}

		if (product.image) {
			const publicId = product.image.split("/").pop().split(".")[0];
			try {
				await cloudinary.uploader.destroy(`products/${publicId}`);
				console.log("deleted image from cloudinary");
			} catch (error) {
				console.log("error deleting image from cloudinary", error);
			}
		}

		await Product.findByIdAndDelete(req.params.id);

		res.json({ message: "Product deleted successfully" });
	} catch (error) {
		console.log("Error in deleteProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getRecommendedProducts = async (req, res) => {
	try {
		const products = await Product.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					price: 1,
				},
			},
		]);

		res.json(products);
	} catch (error) {
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		let products;
		if (category === "book-swap") {
			products = await Product.find({ isBookSwap: true, sold: false });
		} else if (category === "free-section") {
			products = await Product.find({ price: 0, sold: false });
		} else {
			products = await Product.find({ category, sold: false });
		}
		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const toggleFeaturedProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (product) {
			product.isFeatured = !product.isFeatured;
			const updatedProduct = await product.save();
			await updateFeaturedProductsCache();
			res.json(updatedProduct);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in toggleFeaturedProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const toggleProductSoldStatus = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		const isOwner = product.userId.toString() === req.user._id.toString();
		if (!isOwner) {
			return res.status(403).json({ error: "You can only toggle sold status for your own products" });
		}

		product.sold = !product.sold;
		const updatedProduct = await product.save();
		res.json({ sold: updatedProduct.sold, message: `Product marked as ${updatedProduct.sold ? "sold" : "available"}` });
	} catch (error) {
		console.log("Error in toggleProductSoldStatus controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

async function updateFeaturedProductsCache() {
	try {
		const featuredProducts = await Product.find({ isFeatured: true }).lean();
		await redis.set("featured_products", JSON.stringify(featuredProducts));
	} catch (error) {
		console.log("error in update cache function");
	}
}

export const createSwapOffer = async (req, res) => {
	try {
		const { id: targetProductId } = req.params;
		const { offeredProductId } = req.body;
		const userId = req.user._id;

		const targetProduct = await Product.findById(targetProductId);
		if (!targetProduct) {
			return res.status(404).json({ message: "Target product not found" });
		}

		if (!targetProduct.isBookSwap) {
			return res.status(400).json({ message: "This product is not available for swap" });
		}

		const offeredProduct = await Product.findOne({ _id: offeredProductId, userId });
		if (!offeredProduct) {
			return res.status(404).json({ message: "Offered product not found or does not belong to you" });
		}

		if (!offeredProduct.isBookSwap) {
			return res.status(400).json({ message: "Offered product must be listed for Book Swap" });
		}

		// Check if offer already exists
		const existingOffer = targetProduct.swapOffers.find(
			(offer) => offer.offeredProductId.toString() === offeredProductId && offer.userId.toString() === userId.toString()
		);

		if (existingOffer) {
			return res.status(400).json({ message: "You have already made an offer with this product" });
		}

		targetProduct.swapOffers.push({
			offeredProductId,
			userId,
		});

		await targetProduct.save();

		res.status(201).json({ message: "Swap offer created successfully", swapOffers: targetProduct.swapOffers });
	} catch (error) {
		console.log("Error in createSwapOffer controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const acceptSwapOffer = async (req, res) => {
	try {
		const { id: productId, offerId } = req.params;
		const userId = req.user._id;

		const product = await Product.findOne({ _id: productId, userId });
		if (!product) {
			return res.status(404).json({ message: "Product not found or you are not the owner" });
		}

		const offer = product.swapOffers.id(offerId);
		if (!offer) {
			return res.status(404).json({ message: "Offer not found" });
		}

		offer.status = "accepted";

		// Optional: Reject all other pending offers? 
		// For now, let's just accept this one. We might want to mark the product as 'sold' or 'swapped' later.

		await product.save();

		res.json({ message: "Offer accepted", offer });
	} catch (error) {
		console.log("Error in acceptSwapOffer controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const rejectSwapOffer = async (req, res) => {
	try {
		const { id: productId, offerId } = req.params;
		const userId = req.user._id;

		const product = await Product.findOne({ _id: productId, userId });
		if (!product) {
			return res.status(404).json({ message: "Product not found or you are not the owner" });
		}

		const offer = product.swapOffers.id(offerId);
		if (!offer) {
			return res.status(404).json({ message: "Offer not found" });
		}

		offer.status = "rejected";
		await product.save();

		res.json({ message: "Offer rejected", offer });
	} catch (error) {
		console.log("Error in rejectSwapOffer controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getSwapOffers = async (req, res) => {
	try {
		const { id: productId } = req.params;
		const userId = req.user._id;

		const product = await Product.findOne({ _id: productId, userId }).populate({
			path: "swapOffers.offeredProductId",
			select: "name image description category",
		}).populate({
			path: "swapOffers.userId",
			select: "name email",
		});

		if (!product) {
			return res.status(404).json({ message: "Product not found or you are not the owner" });
		}

		res.json({ offers: product.swapOffers });
	} catch (error) {
		console.log("Error in getSwapOffers controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
