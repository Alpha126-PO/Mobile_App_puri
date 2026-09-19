// db/schema.js
// สร้างตารางทั้งหมด + ใส่ข้อมูลตั้งต้น สำหรับแอปสั่งอาหารในร้าน (expo-sqlite)
//
// วิธีใช้ใน App.tsx:
//
//   import { SQLiteProvider } from 'expo-sqlite';
//   import { DATABASE_NAME, initDb, seedDb } from './db/schema';
//
//   <SQLiteProvider
//     databaseName={DATABASE_NAME}
//     onInit={async (db) => {
//       await initDb(db);
//       await seedDb(db);
//     }}
//   >
//     <App />
//   </SQLiteProvider>
//
// ข้อควรรู้:
// - ห้ามเรียก openDatabaseAsync เองในหน้าจอ ให้ SQLiteProvider จัดการที่เดียว (ตามข้อกำหนด §4)
// - ทุกคำสั่งที่รับค่าจากผู้ใช้ ต้องส่งผ่าน ? เท่านั้น ห้ามต่อสตริง SQL เอง
// - ราคาเก็บเป็น INTEGER หน่วยสตางค์เสมอ (ห้ามใช้ REAL)  ดำดำ
 
export const DATABASE_NAME = 'restaurant_order_v2.db';
 
// ---------------------------------------------------------------------------
// 1) สร้างตาราง + index ทั้งหมด (รันครั้งเดียวตอนแอปเปิด — IF NOT EXISTS กันการสร้างซ้ำ)
// ---------------------------------------------------------------------------
export async function initDb(db) {
  // เปิดบังคับ FOREIGN KEY ทุกครั้งที่เชื่อมต่อ (SQLite ไม่จำค่านี้ข้ามการเชื่อมต่อ)
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
 
    -- หมวดหมู่อาหาร -----------------------------------------------------
    CREATE TABLE IF NOT EXISTS categories (
      category_id  INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL
    );
 
    -- เมนูอาหาร (ราคาปัจจุบัน แก้ไขได้) -----------------------------------
    CREATE TABLE IF NOT EXISTS menu_items (
      item_id       INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id   INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
      name          TEXT NOT NULL,
      price_satang  INTEGER NOT NULL CHECK (price_satang > 0),
      is_available  INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0, 1))
    );
 
    -- ตัวเลือกย่อยของเมนู เช่น ไข่ดาว, ไซส์ใหญ่ (มีผลต่อราคา) ------------------
    CREATE TABLE IF NOT EXISTS menu_options (
      option_id           INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id              INTEGER NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
      name                 TEXT NOT NULL,
      price_delta_satang   INTEGER NOT NULL DEFAULT 0
    );
 
    -- โต๊ะในร้าน --------------------------------------------------------
    CREATE TABLE IF NOT EXISTS restaurant_tables (
      table_id      INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number  INTEGER NOT NULL UNIQUE,
      seats         INTEGER NOT NULL DEFAULT 4 CHECK (seats > 0)
    );
 
    -- บิล (1 บิล = 1 มื้อของโต๊ะนั้น) --------------------------------------
    CREATE TABLE IF NOT EXISTS bills (
      bill_id                INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id               INTEGER NOT NULL REFERENCES restaurant_tables(table_id) ON DELETE RESTRICT,
      opened_at              TEXT NOT NULL DEFAULT (datetime('now')),
      closed_at              TEXT,
      status                 TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
      discount_satang        INTEGER NOT NULL DEFAULT 0,
      tax_satang             INTEGER NOT NULL DEFAULT 0,
      service_charge_satang  INTEGER NOT NULL DEFAULT 0
    );
 
    -- รอบการสั่งของแต่ละบิล (สั่งเพิ่มได้หลายรอบ) -----------------------------
    CREATE TABLE IF NOT EXISTS order_rounds (
      round_id      INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id       INTEGER NOT NULL REFERENCES bills(bill_id) ON DELETE CASCADE,
      round_number  INTEGER NOT NULL CHECK (round_number > 0),
      ordered_at    TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (bill_id, round_number)
    );
 
    -- รายการอาหารที่สั่งในแต่ละรอบ (ราคาแช่แข็งไว้ ณ ตอนสั่ง) -------------------
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id      INTEGER PRIMARY KEY AUTOINCREMENT,
      round_id            INTEGER NOT NULL REFERENCES order_rounds(round_id) ON DELETE CASCADE,
      item_id             INTEGER NOT NULL REFERENCES menu_items(item_id) ON DELETE RESTRICT,
      unit_price_satang   INTEGER NOT NULL CHECK (unit_price_satang > 0),
      quantity            INTEGER NOT NULL CHECK (quantity > 0),
      note                TEXT,
      status              TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'cooking', 'served', 'cancelled')),
      cancelled_at        TEXT
    );
 
    -- ตัวเลือกที่ถูกเลือกจริงของแต่ละรายการที่สั่ง (ราคาแช่แข็งไว้เหมือนกัน) --------
    CREATE TABLE IF NOT EXISTS order_item_options (
      order_item_option_id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_item_id                 INTEGER NOT NULL REFERENCES order_items(order_item_id) ON DELETE CASCADE,
      option_id                     INTEGER NOT NULL REFERENCES menu_options(option_id) ON DELETE RESTRICT,
      option_name_snapshot          TEXT NOT NULL,
      price_delta_satang_snapshot   INTEGER NOT NULL
    );
 
    -- index ที่ใช้บ่อย (ตามข้อกำหนด ≥ 2 จุด) --------------------------------
    CREATE INDEX IF NOT EXISTS idx_menu_items_category  ON menu_items (category_id);
    CREATE INDEX IF NOT EXISTS idx_bills_table_status    ON bills (table_id, status);
    CREATE INDEX IF NOT EXISTS idx_order_rounds_bill     ON order_rounds (bill_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_round     ON order_items (round_id);
  `);
}
 
// ---------------------------------------------------------------------------
// 2) ข้อมูลตั้งต้น — แก้ชื่อ/ราคา/จำนวนโต๊ะได้ตามร้านจริงของกลุ่ม
// ---------------------------------------------------------------------------
 
// ราคาทุกตัวเป็น "สตางค์" (บาท x 100) ตามข้อห้ามใช้ REAL ของโจทย์
const CATEGORY_SEED = ['ของคาว', 'ทานเล่น', 'ของหวาน', 'เครื่องดื่ม'];
 
const MENU_ITEM_SEED = [
  // ของคาว (8 รายการ)
  { category: 'ของคาว', name: 'กะเพราหมูสับ', priceSatang: 6000 },
  { category: 'ของคาว', name: 'กะเพราไก่', priceSatang: 6000 },
  { category: 'ของคาว', name: 'ผัดไทยกุ้งสด', priceSatang: 6500 },
  { category: 'ของคาว', name: 'ข้าวผัดปู', priceSatang: 8000 },
  { category: 'ของคาว', name: 'แกงเขียวหวานไก่', priceSatang: 6500 },
  { category: 'ของคาว', name: 'ต้มยำกุ้งน้ำข้น', priceSatang: 9000 },
  { category: 'ของคาว', name: 'ข้าวมันไก่', priceSatang: 5500 },
  { category: 'ของคาว', name: 'ผัดซีอิ๊วหมู', priceSatang: 5500 },
  
  
 
  // ทานเล่น (6 รายการ)
  { category: 'ทานเล่น', name: 'ปอเปี๊ยะทอด', priceSatang: 4000 },
  { category: 'ทานเล่น', name: 'ไก่ทอดหาดใหญ่', priceSatang: 5500 },
  { category: 'ทานเล่น', name: 'เกี๊ยวซ่าหมู', priceSatang: 5000 },
  { category: 'ทานเล่น', name: 'ส้มตำไทย', priceSatang: 4500 },
  { category: 'ทานเล่น', name: 'ไข่เจียวหมูสับ', priceSatang: 4000 },
  { category: 'ทานเล่น', name: 'ปีกไก่ทอดน้ำปลา', priceSatang: 6000 },
 
  // ของหวาน (6 รายการ)
  { category: 'ของหวาน', name: 'ข้าวเหนียวมะม่วง', priceSatang: 7000 },
  { category: 'ของหวาน', name: 'บัวลอยไข่หวาน', priceSatang: 3500 },
  { category: 'ของหวาน', name: 'ทับทิมกรอบ', priceSatang: 3500 },
  { category: 'ของหวาน', name: 'ไอศกรีมกะทิ', priceSatang: 4000 },
  { category: 'ของหวาน', name: 'กล้วยบวชชี', priceSatang: 3000 },
  { category: 'ของหวาน', name: 'เฉาก๊วยนมสด', priceSatang: 3500 },
 
  // เครื่องดื่ม (6 รายการ)
  { category: 'เครื่องดื่ม', name: 'น้ำเปล่า', priceSatang: 1500 },
  { category: 'เครื่องดื่ม', name: 'ชาไทยเย็น', priceSatang: 3000 },
  { category: 'เครื่องดื่ม', name: 'น้ำมะนาวโซดา', priceSatang: 3500 },
  { category: 'เครื่องดื่ม', name: 'กาแฟเย็น', priceSatang: 3500 },
  { category: 'เครื่องดื่ม', name: 'น้ำอัดลม', priceSatang: 2000 },
  { category: 'เครื่องดื่ม', name: 'น้ำส้มคั้นสด', priceSatang: 4000 },
];
// รวม 26 รายการ / 4 หมวดหมู่ — ผ่านเกณฑ์ ≥4 หมวด หมวดละ ≥5 รวม ≥25 ของโจทย์ §2.1 ข้อ ก2
 
const MENU_OPTION_SEED = [
  { itemName: 'กะเพราหมูสับ', name: 'ไข่ดาว', priceDeltaSatang: 1000 },
  { itemName: 'กะเพราหมูสับ', name: 'ไซส์ใหญ่', priceDeltaSatang: 1500 },
  { itemName: 'กะเพราไก่', name: 'ไข่ดาว', priceDeltaSatang: 1000 },
  { itemName: 'ข้าวผัดปู', name: 'ไข่ดาว', priceDeltaSatang: 1000 },
  { itemName: 'ข้าวมันไก่', name: 'เพิ่มไก่', priceDeltaSatang: 2000 },
  { itemName: 'ชาไทยเย็น', name: 'หวานน้อย', priceDeltaSatang: 0 },
  { itemName: 'ชาไทยเย็น', name: 'ไม่ใส่น้ำแข็ง', priceDeltaSatang: 0 },
];
 
// ตามสถานการณ์ในโจทย์ §1: ร้านมี 15 โต๊ะ — จำนวนที่นั่งกำหนดเองต่อโต๊ะ (โต๊ะเล็ก/กลาง/ใหญ่ปนกัน)
const TABLE_SEED = [
  { number: 1, seats: 2 },
  { number: 2, seats: 2 },
  { number: 3, seats: 4 },
  { number: 4, seats: 4 },
  { number: 5, seats: 4 },
  { number: 6, seats: 4 },
  { number: 7, seats: 2 },
  { number: 8, seats: 6 },
  { number: 9, seats: 2 },
  { number: 10, seats: 2 },
  { number: 11, seats: 4 },
  { number: 12, seats: 8 },
  { number: 13, seats: 4 },
  { number: 14, seats: 6 },
  { number: 15, seats: 2 },
];
 
// ---------------------------------------------------------------------------
// 3) ใส่ข้อมูลตั้งต้น — เช็คก่อนว่าเคยใส่ไปแล้วหรือยัง กันการใส่ซ้ำตอนเปิดแอปรอบถัดไป
// ---------------------------------------------------------------------------
export async function seedDb(db) {
  const row = await db.getFirstAsync('SELECT COUNT(*) AS count FROM categories');
  if (row?.count > 0) {
    return; // มีข้อมูลอยู่แล้ว ไม่ต้องใส่ซ้ำ
  }
 
  await db.withTransactionAsync(async () => {
    // categories --------------------------------------------------------
    const categoryIdByName = {};
    for (const name of CATEGORY_SEED) {
      const result = await db.runAsync('INSERT INTO categories (name) VALUES (?)', [name]);
      categoryIdByName[name] = result.lastInsertRowId;
    }
 
    // menu_items ----------------------------------------------------------
    const itemIdByName = {};
    for (const item of MENU_ITEM_SEED) {
      const result = await db.runAsync(
        'INSERT INTO menu_items (category_id, name, price_satang) VALUES (?, ?, ?)',
        [categoryIdByName[item.category], item.name, item.priceSatang]
      );
      itemIdByName[item.name] = result.lastInsertRowId;
    }
 
    // menu_options --------------------------------------------------------
    for (const opt of MENU_OPTION_SEED) {
      await db.runAsync(
        'INSERT INTO menu_options (item_id, name, price_delta_satang) VALUES (?, ?, ?)',
        [itemIdByName[opt.itemName], opt.name, opt.priceDeltaSatang]
      );
    }
 
    // restaurant_tables -----------------------------------------------------
    for (const table of TABLE_SEED) {
      await db.runAsync(
        'INSERT INTO restaurant_tables (table_number, seats) VALUES (?, ?)',
        [table.number, table.seats]
      );
    }
  });
}
 
// ---------------------------------------------------------------------------
// 4) ล้างข้อมูลการขายทั้งหมด (ปุ่ม "รีเซ็ต" ตามข้อกำหนด §4.1 ของโจทย์)
//    ลบแค่ bills พอ — order_rounds / order_items / order_item_options ถูกลบตาม
//    อัตโนมัติเพราะตั้ง ON DELETE CASCADE ไว้ทั้งสายแล้ว (ต้องเปิด PRAGMA foreign_keys
//    ไว้ก่อนถึงจะ cascade จริง ซึ่ง initDb() เปิดให้แล้วทุกครั้งที่เชื่อมต่อ)
//    เมนู/หมวดหมู่/โต๊ะ/ตัวเลือกเมนู "ไม่ถูกลบ" เพราะไม่ใช่ข้อมูลการขาย
// ---------------------------------------------------------------------------
export async function resetSalesData(db) {
  await db.runAsync('DELETE FROM bills');
}