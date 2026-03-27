export const BANKS = [
  "BCA",
  "BNI",
  "BRI",
  "Mandiri",
  "CIMB Niaga",
  "Permata",
  "OVO",
  "GoPay",
  "DANA",
  "ShopeePay",
  "Lainnya",
];

export const PRODUCT_CATS = [
  "Electronics",
  "Home & Living",
  "Fashion",
  "Voucher",
  "Experiences",
  "Wishlist",
  "Lainnya",
];

export const STATUS_MAP = {
  pending: {
    label: "Pending",
    cls: "bg-amber-50 text-amber-600 border-amber-100",
  },
  confirmed: {
    label: "Confirmed",
    cls: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-500 border-red-100" },
};

export const EMPTY_BANK = {
  type: "bank_transfer",
  sender_name: "",
  amount: "",
  bank_name: "BCA",
  account_number: "",
  transfer_date: "",
  status: "pending",
  notes: "",
};

export const EMPTY_PHYSICAL = {
  type: "physical",
  sender_name: "",
  status: "pending",
  notes: "",
  product_name: "",
  product_category: "Lainnya",
  product_description: "",
  product_link: "",
  price_range_min: "",
  price_range_max: "",
  registry_item_id: "",
};

export const EMPTY_REG = {
  name: "",
  brand: "",
  description: "",
  image_url: "",
  tag: "",
  quantity_needed: 1,
  price_range: "",
  shop_url: "",
  is_active: true,
};

export const REG_TAGS = [
  "Kitchen",
  "Home",
  "Electronics",
  "Fashion",
  "Experience",
  "Voucher",
  "Lainnya",
];
