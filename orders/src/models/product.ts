import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';

interface ProductAttrs {
  id: string;
  title: string;
  price: number;
}

export interface ProductDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface ProductModel extends mongoose.Model<ProductDoc> {
  build(attrs: ProductAttrs): ProductDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<ProductDoc | null>;
}

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

productSchema.set('versionKey', 'version');
productSchema.plugin(updateIfCurrentPlugin);

productSchema.statics.findByEvent = (event: {
  id: string;
  version: number;
}) => {
  return Product.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};
productSchema.statics.build = (attrs: ProductAttrs) => {
  return new Product({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

// running query to look at all orders and find product and look at status of order
// and make sure its not cancelled
productSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    product: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  return !!existingOrder;
};

const Product = mongoose.model<ProductDoc, ProductModel>(
  'Product',
  productSchema
);

export { Product };
