import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
	products: [],
	loading: false,
	pendingOffersCount: 0,
	searchResults: [],
	searchLoading: false,

	setProducts: (products) => set({ products }),

	searchProducts: async (query) => {
		if (!query || query.trim().length === 0) {
			set({ searchResults: [], searchLoading: false });
			return;
		}
		set({ searchLoading: true });
		try {
			const response = await axios.get(`/products/search?q=${encodeURIComponent(query)}`);
			set({ searchResults: response.data.products, searchLoading: false });
		} catch (error) {
			set({ searchResults: [], searchLoading: false });
			console.error("Error searching products:", error);
		}
	},

	clearSearchResults: () => set({ searchResults: [] }),

	createProduct: async (productData) => {
		set({ loading: true });
		try {
			const res = await axios.post("/products", productData);
			set((prevState) => ({
				products: [...prevState.products, res.data],
				loading: false,
			}));
			toast.success("Product created successfully!");
		} catch (error) {
			set({ loading: false });
			const errorMessage = error.response?.data?.error || error.message || "Failed to create product";
			toast.error(errorMessage);
			// Re-throw the error so the form can catch it and preserve user input
			throw error;
		}
	},
	fetchAllProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products");
			set({ products: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},
	fetchProductsByCategory: async (category) => {
		set({ loading: true });
		try {
			const response = await axios.get(`/products/category/${category}`);
			set({ products: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},
	deleteProduct: async (productId) => {
		set({ loading: true });
		try {
			await axios.delete(`/products/${productId}`);
			set((prevProducts) => ({
				products: prevProducts.products.filter((product) => product._id !== productId),
				loading: false,
			}));
			toast.success("Product deleted successfully");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to delete product");
		}
	},
	toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.patch(`/products/${productId}`);
			// this will update the isFeatured prop of the product
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
				),
				loading: false,
			}));
			toast.success(
				`Product ${response.data.isFeatured ? "marked as" : "removed from"} featured`
			);
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to update product");
		}
	},
	fetchFeaturedProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products/featured");
			set({ products: response.data, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response?.data?.error || "Error fetching featured products");
			console.log("Error fetching featured products:", error);
		}
	},

	fetchMyProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products/my-products");
			set({ products: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch your products", loading: false });
			console.error("Error fetching my products:", error);
			toast.error(error.response?.data?.error || "Error fetching your products");
		}
	},

	createSwapOffer: async (targetProductId, offeredProductId) => {
		set({ loading: true });
		try {
			await axios.post(`/products/${targetProductId}/offer`, { offeredProductId });
			set({ loading: false });
			toast.success("Swap offer sent successfully!");
			return true;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to send swap offer");
			return false;
		}
	},

	fetchProductOffers: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.get(`/products/${productId}/offers`);
			set({ loading: false });
			return response.data.offers;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to fetch offers");
			return [];
		}
	},

	acceptSwapOffer: async (productId, offerId) => {
		set({ loading: true });
		try {
			await axios.put(`/products/${productId}/offer/${offerId}/accept`);
			set({ loading: false });
			toast.success("Offer accepted!");
			return true;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to accept offer");
			return false;
		}
	},

	rejectSwapOffer: async (productId, offerId) => {
		set({ loading: true });
		try {
			await axios.put(`/products/${productId}/offer/${offerId}/reject`);
			set({ loading: false });
			toast.success("Offer rejected");
			return true;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to reject offer");
			return false;
		}
	},

	fetchPendingOffersCount: async () => {
		try {
			const response = await axios.get("/products/offers/count");
			set({ pendingOffersCount: response.data.count });
		} catch (error) {
			console.error("Error fetching pending offers count:", error);
		}
	},

	toggleProductSoldStatus: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.patch(`/products/${productId}/toggle-sold`);
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, sold: response.data.sold } : product
				),
				loading: false,
			}));
			toast.success(
				`Product marked as ${response.data.sold ? "sold" : "available"}`
			);
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.error || "Failed to update product status");
		}
	},
}));
