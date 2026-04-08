import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set, get) => ({
	products: [], // Generic list used for browsing/categories
	adminProducts: [], // Separate list for Global Directory
	userProducts: [], // Separate list for My Products
	loading: false,
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
				userProducts: [...prevState.userProducts, res.data],
				loading: false,
			}));
			toast.success("Product created successfully!");
		} catch (error) {
			set({ loading: false });
			const errorMessage = error.response?.data?.error || error.message || "Failed to create product";
			toast.error(errorMessage);
			throw error;
		}
	},
	fetchAllProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products");
			set({ adminProducts: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response?.data?.error || "Failed to fetch products");
		}
	},
	fetchProductsByCategory: async (category) => {
		set({ loading: true });
        
        const timeoutId = setTimeout(() => {
            const { loading } = get();
            if (loading) {
                set({ loading: false });
                toast.error("Resource fetch timed out. Please refresh.");
            }
        }, 10000);

		try {
			const response = await axios.get(`/products/category/${category}`);
            clearTimeout(timeoutId);
			set({ products: response.data.products, loading: false });
		} catch (error) {
            clearTimeout(timeoutId);
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response?.data?.error || "Failed to fetch products");
		}
	},
	deleteProduct: async (productId) => {
		set({ loading: true });
		try {
			await axios.delete(`/products/${productId}`);
			set((prevState) => ({
				adminProducts: prevState.adminProducts.filter((p) => p._id !== productId),
				userProducts: prevState.userProducts.filter((p) => p._id !== productId),
				products: prevState.products.filter((p) => p._id !== productId),
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
			set((prevState) => ({
				adminProducts: prevState.adminProducts.map((p) =>
					p._id === productId ? { ...p, isFeatured: response.data.isFeatured } : p
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
			set({ userProducts: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch your products", loading: false });
			console.error("Error fetching my products:", error);
			toast.error(error.response?.data?.error || "Error fetching your products");
		}
	},

	toggleProductSoldStatus: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.patch(`/products/${productId}/toggle-sold`);
			set((prevState) => ({
				userProducts: prevState.userProducts.map((p) =>
					p._id === productId ? { ...p, sold: response.data.sold } : p
				),
				adminProducts: prevState.adminProducts.map((p) =>
					p._id === productId ? { ...p, sold: response.data.sold } : p
				),
				loading: false,
			}));
			toast.success(
				`Product marked as ${response.data.sold ? "SOLD" : "AVAILABLE"}`
			);
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.error || "Failed to update product status");
		}
	},
}));
