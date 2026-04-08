import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }
      }
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    stripeSessionId: { type: String, unique: true }
});
const Order = mongoose.model('Order', OrderSchema);

mongoose.connect("mongodb+srv://krish:vedshare@cluster0.hqnrksq.mongodb.net/vedshare-db?retryWrites=true&w=majority&appName=Cluster0").then(async () => {
    const count = await Order.countDocuments();
    console.log('Total Orders:', count);
    const sales = await Order.aggregate([{ $unwind: '$products' }, { $group: { _id: null, totalSales: { $sum: '$products.quantity' } } }]);
    console.log('Total Sales:', sales[0]?.totalSales);
    const rev = await Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }]);
    console.log('Total Revenue:', rev[0]?.totalRevenue);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
