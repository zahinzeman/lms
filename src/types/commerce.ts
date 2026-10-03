import { OrderStatus, PaymentProvider, ProductType } from "./database";

export interface DigitalProduct {
  id: string;
  creator_id: string;
  creator?: {
    id: string;
    handle: string;
    full_name: string;
    avatar_url: string | null;
  };
  title: string;
  slug: string;
  subtitle: string | null;
  type: ProductType;
  description: any;
  description_text: string | null;
  category_id: string | null;
  cover_url: string;
  gallery: string[];
  price_minor: number;
  compare_at_price_minor: number | null;
  currency: "BDT" | "USD";
  pay_what_you_want: boolean;
  min_price_minor: number | null;
  license_text: string | null;
  version: string | null;
  file_count: number;
  sales_count: number;
  rating_avg: number;
  rating_count: number;
  files?: ProductFile[];
  created_at: string;
  updated_at: string;
}

export interface ProductFile {
  id: string;
  product_id: string;
  name: string;
  file_path: string;
  size_bytes: number;
  mime: string;
  version: string;
  position: number;
}

export interface CartItem {
  id: string;
  item_type: "course" | "product" | "plan";
  item_id: string;
  title: string;
  creator_name: string;
  thumbnail_url: string;
  price_minor: number;
  currency: "BDT" | "USD";
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  currency: "BDT" | "USD";
  subtotal_minor: number;
  discount_minor: number;
  tax_minor: number;
  total_minor: number;
  provider: PaymentProvider;
  paid_at: string | null;
  billing_name: string | null;
  billing_email: string | null;
  created_at: string;
}
