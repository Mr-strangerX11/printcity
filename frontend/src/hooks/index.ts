export { useFetch } from './useFetch';
export type { FetchState } from './useFetch';

export { useProducts, useProduct, useCategories } from './useProducts';
export type { ProductsParams } from './useProducts';

export { useOrders, useOrder, useOrderStats } from './useOrders';
export type { OrdersParams } from './useOrders';

export { useVendors, useVendor, useVendorProfile } from './useVendors';
export type { VendorsParams } from './useVendors';

export { useInvoices, useInvoice, useInvoiceStats } from './useInvoices';
export type { InvoicesParams } from './useInvoices';

export { usePayouts, usePayoutEarnings } from './usePayouts';
export type { PayoutsParams } from './usePayouts';

export { useSupportTickets, useSupportTicket, useSupportStats } from './useSupport';
export type { SupportParams } from './useSupport';

export { useCoupons, useCouponStats } from './useCoupons';
export type { CouponsParams } from './useCoupons';

export { useCustomDesigns, useCustomDesign } from './useCustomDesigns';
export type { CustomDesignsParams } from './useCustomDesigns';

export { usePrintJobs, usePrintJobStats, useQualityChecks, useShipments } from './useProduction';
export type { ProductionParams } from './useProduction';

export { useWishlistItems } from './useWishlistItems';
export type { WishlistItem } from './useWishlistItems';

export { useAddresses } from './useAddresses';
export type { Address } from './useAddresses';

export { useNotifications, useUnreadCount } from './useNotifications';
export type { NotificationsParams } from './useNotifications';

export { useLoyaltyPoints, useLoyaltyRewards, useLoyaltyTier } from './useLoyalty';
export type { LoyaltyPoints, LoyaltyReward, LoyaltyTierStatus } from './useLoyalty';

export { useReferralCode, useReferralStats } from './useReferral';
export type { ReferralCode, ReferralStats } from './useReferral';

export {
  useAdminKpis, useRevenueAnalytics, useOrdersByStatus,
  useVendorsRevenue, usePaymentMethods, useSystemHealth,
  useVendorSales, useVendorOrdersByStatus,
} from './useAnalytics';
export type { Period, AdminKpis, RevenueDataPoint, OrderStatusData, VendorRevenueData, PaymentMethodData, SystemHealth, VendorSalesSummary } from './useAnalytics';

export { useReducedMotion } from './useReducedMotion';
