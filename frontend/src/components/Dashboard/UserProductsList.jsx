import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash, Package, RefreshCw, Check, X } from "lucide-react";
import { useProductStore } from "../../stores/useProductStore";

const UserProductsList = () => {
  const { deleteProduct, products, fetchMyProducts, fetchProductOffers, acceptSwapOffer, rejectSwapOffer } = useProductStore();
  const [selectedProductOffers, setSelectedProductOffers] = useState(null);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  const handleViewOffers = async (productId) => {
    setCurrentProductId(productId);
    const offers = await fetchProductOffers(productId);
    setSelectedProductOffers(offers);
    setIsOffersModalOpen(true);
  };

  const handleAcceptOffer = async (offerId) => {
    const success = await acceptSwapOffer(currentProductId, offerId);
    if (success) {
      // Refresh offers
      const offers = await fetchProductOffers(currentProductId);
      setSelectedProductOffers(offers);
    }
  };

  const handleRejectOffer = async (offerId) => {
    const success = await rejectSwapOffer(currentProductId, offerId);
    if (success) {
      // Refresh offers
      const offers = await fetchProductOffers(currentProductId);
      setSelectedProductOffers(offers);
    }
  };

  return (
    <motion.div
      className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 shadow-xl rounded-2xl overflow-hidden max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="p-6 border-b border-gray-700/50 flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <Package className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white">My Products</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700/50">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50 bg-transparent">
            {products?.map((product) => (
              <tr key={product._id} className="hover:bg-gray-700/30 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 relative group">
                      <img
                        className="h-12 w-12 rounded-xl object-cover border border-gray-700 shadow-sm group-hover:scale-110 transition-transform duration-200"
                        src={product.image}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">{product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-emerald-400">
                    {product.price === 0 ? "Free" : `₹${product.price.toFixed(2)}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
                      {product.category}
                    </span>
                    {product.isBookSwap && (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit">
                        Book Swap
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {product.isBookSwap && (
                      <button
                        onClick={() => handleViewOffers(product._id)}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 p-2 rounded-lg transition-colors duration-200 relative"
                        title="View Offers"
                      >
                        <RefreshCw className="h-5 w-5" />
                        {product.pendingOffersCount > 0 && (
                          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse'>
                            {product.pendingOffersCount}
                          </span>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition-colors duration-200"
                      title="Delete Product"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products?.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package className="mx-auto h-12 w-12 text-gray-600 mb-3" />
            <p>No products found. Start selling today!</p>
          </div>
        )}
      </div>

      {/* Offers Modal */}
      <AnimatePresence>
        {isOffersModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl shadow-xl border border-gray-700 max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Swap Offers</h3>
                <button
                  onClick={() => setIsOffersModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {selectedProductOffers?.length > 0 ? (
                <div className="space-y-4">
                  {selectedProductOffers.map((offer) => (
                    <div
                      key={offer._id}
                      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 flex flex-col sm:flex-row gap-4 items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {offer.offeredProductId ? (
                          <>
                            <Link to={`/product/${offer.offeredProductId._id}`} className="shrink-0">
                              <img
                                src={offer.offeredProductId.image}
                                alt={offer.offeredProductId.name}
                                className="w-16 h-16 object-cover rounded-md hover:opacity-80 transition-opacity"
                              />
                            </Link>
                            <div>
                              <Link to={`/product/${offer.offeredProductId._id}`}>
                                <h4 className="font-semibold text-white hover:text-cyan-400 transition-colors">
                                  {offer.offeredProductId.name}
                                </h4>
                              </Link>
                              <p className="text-sm text-gray-400">
                                Offered by: <span className="text-gray-300">{offer.userId?.name || "Unknown User"}</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Status: <span className={`font-medium ${offer.status === 'accepted' ? 'text-green-400' :
                                    offer.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                                  }`}>{offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}</span>
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-400 italic">
                            Product unavailable (deleted)
                          </div>
                        )}
                      </div>

                      {offer.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptOffer(offer._id)}
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                            title="Accept Offer"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={() => handleRejectOffer(offer._id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            title="Reject Offer"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No offers received yet.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserProductsList;
