// ── Canonical Apparel SKU Catalog ────────────────────────────────────────────
// Single source of truth for all demo/mock product data across StoreHub.
// Aligns with Planogram Intelligence (Apparel / Accessories / Seasonal).
// SKU pattern: DEPT-CLASS-NNN

export interface ApparelSku {
  sku: string;
  name: string;
  department: string;
  subDept: string;
  itemClass: string;
  brand: string;
  category: 'Apparel' | 'Accessories' | 'Seasonal' | 'Footwear';
}

export const APPAREL_CATALOG: ApparelSku[] = [
  // ── Women's ────────────────────────────────────────────────────────────────
  { sku: 'WOM-BLZ-001', name: "Women's Classic Blazer",       department: "Women's",   subDept: 'Tops',       itemClass: 'Blazers',    brand: 'Premium Line',      category: 'Apparel' },
  { sku: 'WOM-TOP-014', name: "Women's V-Neck Basics",        department: "Women's",   subDept: 'Tops',       itemClass: 'Basics',     brand: 'Core Essentials',   category: 'Apparel' },
  { sku: 'WOM-DRS-008', name: 'Summer Midi Dress',            department: "Women's",   subDept: 'Dresses',    itemClass: 'Midi',       brand: 'Core Essentials',   category: 'Apparel' },
  { sku: 'WOM-DRS-014', name: 'Floral Midi Dress — Navy',     department: "Women's",   subDept: 'Dresses',    itemClass: 'Casual',     brand: 'Premium Line',      category: 'Apparel' },
  { sku: 'WOM-DRS-021', name: 'Linen Wrap Dress — White',     department: "Women's",   subDept: 'Dresses',    itemClass: 'Casual',     brand: 'Premium Line',      category: 'Apparel' },
  { sku: 'WOM-DNM-005', name: 'High-Rise Skinny Jeans',       department: "Women's",   subDept: 'Bottoms',    itemClass: 'Denim',      brand: 'Core Essentials',   category: 'Apparel' },
  { sku: 'WOM-OUT-003', name: 'Wool Trench Coat',             department: "Women's",   subDept: 'Outerwear',  itemClass: 'Coats',      brand: 'Premium Line',      category: 'Apparel' },
  { sku: 'WOM-ACT-002', name: 'Athletic Leggings',            department: "Women's",   subDept: 'Activewear', itemClass: 'Bottoms',    brand: 'Active Collection',       category: 'Apparel' },
  // ── Men's ─────────────────────────────────────────────────────────────────
  { sku: 'MEN-TEE-009', name: 'Classic Fit Tee — White',      department: "Men's",     subDept: 'Tops',       itemClass: 'Tees',       brand: 'Core Essentials',   category: 'Apparel' },
  { sku: 'MEN-PLO-002', name: "Men's Polo Classic",           department: "Men's",     subDept: 'Tops',       itemClass: 'Polos',      brand: 'Core Essentials',   category: 'Apparel' },
  { sku: 'MEN-DNM-003', name: 'Slim Fit Denim — Dark Wash',   department: "Men's",     subDept: 'Bottoms',    itemClass: 'Denim',      brand: 'Core Essentials',   category: 'Apparel' },
  { sku: 'MEN-DNM-011', name: 'Straight Leg Jeans — Black',   department: "Men's",     subDept: 'Bottoms',    itemClass: 'Denim',      brand: 'Core Essentials',   category: 'Apparel' },
  { sku: 'MEN-CHN-007', name: "Men's Stretch Chino",          department: "Men's",     subDept: 'Bottoms',    itemClass: 'Chinos',     brand: 'Premium Line',      category: 'Apparel' },
  { sku: 'MEN-OUT-006', name: 'Puffer Jacket',                department: "Men's",     subDept: 'Outerwear',  itemClass: 'Jackets',    brand: 'Premium Line',      category: 'Apparel' },
  { sku: 'MEN-ACT-004', name: 'Athletic Compression Tee',     department: "Men's",     subDept: 'Activewear', itemClass: 'Tops',       brand: 'Active Collection',       category: 'Apparel' },
  { sku: 'MEN-SHI-017', name: 'Oxford Button-Down Shirt',     department: "Men's",     subDept: 'Tops',       itemClass: 'Shirts',     brand: 'Premium Line',      category: 'Apparel' },
  // ── Kids ──────────────────────────────────────────────────────────────────
  { sku: 'KID-TSH-012', name: 'Kids Color Block Tee',         department: 'Kids',      subDept: 'Tops',       itemClass: 'Tees',       brand: 'Kids Collection',         category: 'Apparel' },
  { sku: 'KID-SHT-019', name: 'Kids Cargo Shorts',            department: 'Kids',      subDept: 'Bottoms',    itemClass: 'Shorts',     brand: 'Kids Collection',         category: 'Apparel' },
  { sku: 'KID-DRS-008', name: 'Kids Party Dress',             department: 'Kids',      subDept: 'Dresses',    itemClass: 'Party',      brand: 'Kids Collection',         category: 'Apparel' },
  { sku: 'KID-PAJ-022', name: "Kids Pajama Set",              department: 'Kids',      subDept: 'Nightwear',  itemClass: 'Pajamas',    brand: 'Kids Collection',         category: 'Apparel' },
  // ── Accessories ───────────────────────────────────────────────────────────
  { sku: 'ACC-BAG-005', name: 'Canvas Tote Bag',              department: 'Accessories', subDept: 'Bags',     itemClass: 'Totes',      brand: 'Premium Line',      category: 'Accessories' },
  { sku: 'ACC-BAG-011', name: 'Leather Crossbody Bag',        department: 'Accessories', subDept: 'Bags',     itemClass: 'Crossbody',  brand: 'Designer Collab',  category: 'Accessories' },
  { sku: 'ACC-SCF-009', name: 'Silk Blend Scarf',             department: 'Accessories', subDept: 'Scarves',  itemClass: 'Scarves',    brand: 'Premium Line',      category: 'Accessories' },
  { sku: 'ACC-BLT-011', name: 'Leather Belt Classic',         department: 'Accessories', subDept: 'Belts',    itemClass: 'Belts',      brand: 'Core Essentials',   category: 'Accessories' },
  { sku: 'ACC-JWL-007', name: 'Statement Necklace',           department: 'Accessories', subDept: 'Jewelry',  itemClass: 'Necklaces',  brand: 'Designer Collab',  category: 'Accessories' },
  { sku: 'ACC-HAT-013', name: 'Bucket Hat',                   department: 'Accessories', subDept: 'Hats',     itemClass: 'Hats',       brand: 'Partner Brand',    category: 'Accessories' },
  // ── Seasonal ──────────────────────────────────────────────────────────────
  { sku: 'SEA-JKT-004', name: 'Seasonal Rain Jacket',         department: 'Seasonal',  subDept: 'Outerwear',  itemClass: 'Jackets',    brand: 'Premium Line',      category: 'Seasonal' },
  { sku: 'SEA-HOO-014', name: 'Limited Edition Hoodie',       department: 'Seasonal',  subDept: 'Tops',       itemClass: 'Limited',    brand: 'Designer Collab',  category: 'Seasonal' },
  { sku: 'SEA-DRS-015', name: 'Sale Clearance Dress',         department: 'Seasonal',  subDept: 'Dresses',    itemClass: 'Sale',       brand: 'Core Essentials',   category: 'Seasonal' },
  // ── Footwear ──────────────────────────────────────────────────────────────
  { sku: 'FTW-RUN-002', name: 'Running Shoes Elite',          department: 'Footwear',  subDept: 'Athletic',   itemClass: 'Running',    brand: 'Active Collection',       category: 'Apparel' },
  { sku: 'FTW-FRM-002', name: 'Oxford Leather Shoes — Black', department: 'Footwear',  subDept: 'Formal',     itemClass: 'Formal',     brand: 'Premium Line',      category: 'Apparel' },
  { sku: 'FTW-SNK-008', name: 'Canvas Sneakers — White',      department: 'Footwear',  subDept: 'Casual',     itemClass: 'Sneakers',   brand: 'Partner Brand',    category: 'Apparel' },
];

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function findBySku(sku: string): ApparelSku | undefined {
  return APPAREL_CATALOG.find(s => s.sku === sku);
}

export function getByDept(department: string): ApparelSku[] {
  return APPAREL_CATALOG.filter(s => s.department === department);
}

export function getByCategory(category: ApparelSku['category']): ApparelSku[] {
  return APPAREL_CATALOG.filter(s => s.category === category);
}

/** Return exactly n SKUs cycling through the catalog deterministically */
export function getApparelSkus(n: number, offset = 0): ApparelSku[] {
  const result: ApparelSku[] = [];
  for (let i = 0; i < n; i++) {
    result.push(APPAREL_CATALOG[(offset + i) % APPAREL_CATALOG.length]);
  }
  return result;
}

// ── Department-level alert grouping (mirrors Planogram Intelligence clusters) ─

export const APPAREL_ALERT_DEPARTMENTS = [
  { dept: "Women's",    label: "Women's Apparel",   count: 0 },
  { dept: "Men's",      label: "Men's Apparel",     count: 0 },
  { dept: 'Kids',       label: 'Kids Apparel',      count: 0 },
  { dept: 'Accessories',label: 'Accessories',       count: 0 },
  { dept: 'Seasonal',   label: 'Seasonal',          count: 0 },
  { dept: 'Footwear',   label: 'Footwear',          count: 0 },
  { dept: 'Activewear', label: 'Activewear',        count: 0 },
];
