import type { Product } from '../types/product'
import type { Order, OrderItem } from '../types/order'

export function mapProduct(db: any): Product {
  if (!db) return db
  return {
    id: db.id,
    name: db.name,
    brand: db.brand,
    genericName: db.generic_name ?? db.genericName,
    manufacturerId: db.manufacturer_id ?? db.manufacturerId,
    categoryId: db.category_id ?? db.categoryId,
    description: db.description ?? '',
    price: Number(db.price),
    originalPrice: db.original_price != null ? Number(db.original_price) : undefined,
    discountPercent: db.discount_percent ?? db.discountPercent ?? 0,
    stock: Number(db.stock ?? 0),
    unit: db.unit ?? 'pack',
    image: db.image_url ?? db.image ?? undefined,
    primaryImage: db.image_url ?? db.primaryImage ?? db.image ?? undefined,
    secondaryImage: db.secondary_image_url ?? db.secondaryImage ?? undefined,
    isActive: db.is_active ?? db.isActive ?? true,
    isFeatured: db.is_featured ?? db.isFeatured ?? false,
    batchNumber: db.batch_number ?? db.batchNumber ?? undefined,
    expiryDate: db.expiry_date ?? db.expiryDate ?? undefined,
    createdAt: db.created_at ?? db.createdAt,
    // keep raw relations for convenience
    // @ts-ignore
    _rawCategory: db.categories ?? undefined,
    // @ts-ignore
    _rawManufacturer: db.manufacturers ?? undefined,
  } as Product & { _rawCategory?: any; _rawManufacturer?: any }
}

export function mapOrder(db: any): Order {
  const rawItems = db.order_items ?? db.items ?? []
  const items: OrderItem[] = rawItems.map((it: any) => ({
    id: it.id,
    productId: it.product_id ?? it.productId,
    productName: it.product_name ?? it.productName,
    quantity: it.quantity,
    unitPrice: Number(it.unit_price ?? it.unitPrice),
    discountPercent: it.discount_percent ?? it.discountPercent ?? 0,
    total: Number(it.total),
  }))
  return {
    id: db.id,
    orderNumber: db.order_number ?? db.orderNumber,
    customerId: db.customer_id ?? db.customerId,
    customerName: db.customer_name ?? db.customerName,
    createdAt: db.created_at ?? db.createdAt,
    status: db.status,
    subtotal: Number(db.subtotal ?? 0),
    discount: Number(db.discount ?? 0),
    deliveryFee: Number(db.delivery_fee ?? db.deliveryFee ?? 150),
    total: Number(db.total ?? 0),
    paymentMethod: db.payment_method ?? db.paymentMethod ?? 'CASH_ON_DELIVERY',
    address: db.address ?? '',
    items,
    timeline: db.timeline ?? [],
  }
}
