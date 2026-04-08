import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
	try {
		// Admins should see everything
		const products = await Product.find({}).populate('userId', 'name email');
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
		res.json({ products });
	} catch (error) {
		console.error("Error fetching user products:", error.message);
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
		// only fetch products that are NOT sold
		featuredProducts = await Product.find({ isFeatured: true, sold: false }).lean();

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
		const { name, description, price, image, category, pdf, tags, images } = req.body;

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

		const uploadPromises = [];

		// ---- IMAGE UPLOAD (PUBLIC) ----
		if (image) {
			uploadPromises.push(
				cloudinary.uploader.upload(image, {
					upload_preset: "jrjc35xt",
					folder: "products",
					type: "upload"
				}).then(res => { cloudinaryResponse = res; })
			);
		}

		// ---- ANGLE IMAGES UPLOAD (PUBLIC) ----
		if (images && typeof images === 'object') {
			const angles = ['back', 'left', 'right'];
			angles.forEach(angle => {
				if (images[angle]) {
					uploadPromises.push(
						cloudinary.uploader.upload(images[angle], {
							upload_preset: "jrjc35xt",
							folder: "products/angles",
							type: "upload"
						}).then(res => { angleImages[angle] = res.secure_url; })
						.catch(error => console.log(`Error uploading ${angle} image:`, error.message))
					);
				}
			});
		}

		// ---- PDF UPLOAD (PUBLIC) ----
		if (pdf) {
			uploadPromises.push(
				cloudinary.uploader.upload(pdf, {
					upload_preset: "jrjc35xt",
					folder: "products_pdfs",
					resource_type: "raw",
					type: "upload"
				}).then(res => { cloudinaryPdfResponse = res; })
			);
		}

		// Execute all uploads concurrently for massive performance boost
		await Promise.all(uploadPromises);


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
				$match: { sold: false }
			},
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
		if (category === "all") {
			products = await Product.find({ sold: false }).lean();
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

