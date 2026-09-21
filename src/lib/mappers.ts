import type { Product } from '../types/product'
import type { Order, OrderItem } from '../types/order'
import type { Address } from '../types/address'
import type { NotificationItem } from '../types/notification'
import type { DeliveryCycle } from '../types/deliveryCycle'
import type { ReturnRequest } from '../types/return'
import type { AuditEntry } from '../types/audit'

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
    costPrice: db.cost_price != null ? Number(db.cost_price) : db.costPrice != null ? Number(db.costPrice) : undefined,
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

export function mapAddress(db: any): Address {
  if (!db) return db
  return {
    id: db.id,
    label: db.label,
    street: db.street,
    city: db.city,
    county: db.county ?? undefined,
    postalCode: db.postal_code ?? db.postalCode ?? undefined,
    isDefault: db.is_default ?? db.isDefault ?? false,
  }
}

export function mapNotification(db: any): NotificationItem {
  if (!db) return db
  return {
    id: db.id,
    title: db.title,
    body: db.body,
    createdAt: db.created_at ?? db.createdAt,
    read: db.read ?? false,
    type: db.type ?? 'info',
  }
}

export function mapDeliveryCycle(db: any): DeliveryCycle {
  if (!db) return db
  const rawItems = db.delivery_cycle_items ?? db.items ?? []
  const products = rawItems.map((it: any) => {
    const p = it.products ?? it.product ?? {}
    return {
      id: p.id ?? it.product_id,
      name: p.name ?? 'Unknown',
      price: p.price != null ? Number(p.price) : undefined,
      image: p.image_url ?? p.image,
      quantity: it.quantity,
      ...p,
    }
  })
  return {
    id: db.id,
    customerId: db.customer_id ?? db.customerId,
    status: db.status,
    startedAt: db.started_at ?? db.startedAt,
    closesAt: db.closes_at ?? db.closesAt,
    estimatedTotal: Number(db.estimated_total ?? db.estimatedTotal ?? 0),
    products: products.length ? products : (db.products ?? []),
    createdAt: db.created_at ?? db.createdAt,
  }
}

export function mapReturnRequest(db: any): ReturnRequest {
  if (!db) return db
  return {
    id: db.id,
    orderId: db.order_id ?? db.orderId,
    customerId: db.customer_id ?? db.customerId,
    customerName: db.customer_name ?? db.customerName,
    productName: db.product_name ?? db.productName,
    quantity: db.quantity,
    reason: db.reason,
    status: db.status,
    createdAt: db.created_at ?? db.createdAt,
  }
}

export function mapAuditEntry(db: any): AuditEntry {
  if (!db) return db
  return {
    id: db.id,
    actor: db.actor_id ?? db.actor ?? '',
    action: db.action,
    timestamp: db.timestamp ?? db.created_at ?? new Date().toISOString(),
    recordType: db.record_type ?? db.recordType ?? '',
    oldValue: typeof db.old_value === 'string' ? db.old_value : db.old_value ? JSON.stringify(db.old_value) : undefined,
    newValue: typeof db.new_value === 'string' ? db.new_value : db.new_value ? JSON.stringify(db.new_value) : undefined,
  }
}
