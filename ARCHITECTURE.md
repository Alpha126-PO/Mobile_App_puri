# ARCHITECTURE.md — คู่มือโค้ดสำหรับทีม

## ภาพรวม flow ของแอป (ฝั่งลูกค้า)

```
Select_Table.js  →  Menu_Screen.js  →  Item_Detail_Screen.js (modal)
                          ↓                      ↓
                          └────── CartContext ───┘
                          ↓
                   Review_Screen.js  →  (ส่งครัวสำเร็จ) → กลับไป Menu_Screen.js
```

- **`CartContext`** คือ "ตะกร้าของรอบที่กำลังสั่ง" เก็บอยู่ที่เดียว ทุกหน้าจออ่าน/แก้ผ่าน `useCart()` — ยังไม่มีอะไรลง DB จนกว่าจะกด "ส่งเข้าครัว"
- ทุก query ที่คุยกับ SQLite แยกไว้ในโฟลเดอร์ `src/db/` (ตามข้อกำหนดโจทย์ §4 ห้ามหน้าจอเขียน SQL เอง)

---

## `App.js` (root)

จุดเริ่มต้นของแอป ทำ 3 อย่าง:
1. เปิด SQLite ด้วย `SQLiteProvider` (ที่เดียวในทั้งแอป) — `onInit` เรียก `initDb` (สร้างตาราง) แล้ว `seedDb` (ใส่ข้อมูลตั้งต้น)
2. ครอบด้วย `CartProvider` ให้ทุกหน้าจอเข้าถึงตะกร้าเดียวกันได้
3. ตั้ง `Stack.Navigator` ลงทะเบียนทุกหน้าจอ (`SelectTable`, `MenuScreen`, `ReviewScreen`, `ItemDetailScreen`)

---

## `src/db/` — query ทั้งหมด (ห้ามหน้าจอเขียน SQL เอง)

```
src/db/
├── db.js                    ← schema + ข้อมูลตั้งต้น + รีเซ็ต (setup ทั้งระบบ)
└── queries_customer/        ← query ที่หน้าจอฝั่งลูกค้าเรียกใช้ตอนแอปทำงานจริง (แยกตาม entity)
    ├── tables.js
    ├── menu.js
    └── orders.js
```

เหตุผลที่แยก: `db.js` ทำงาน "ครั้งเดียวตอนตั้งค่าระบบ" (schema+seed+reset) ส่วนไฟล์ใน `queries_customer/` ถูกเรียกซ้ำๆ ตลอดตอนผู้ใช้ใช้งานแอป (ตั้งชื่อว่า `_customer` เผื่อภายหลังมี `queries_kitchen/` แยกสำหรับฝั่งครัว)

### `db.js` — schema + ข้อมูลตั้งต้น + รีเซ็ต

| export | หน้าที่ |
|---|---|
| `DATABASE_NAME` | ชื่อไฟล์ DB (เปลี่ยนเลข version ท้ายชื่อทุกครั้งที่แก้ schema/seed เพื่อบังคับสร้างไฟล์ใหม่ตอนทดสอบ) |
| `initDb(db)` | รัน `CREATE TABLE IF NOT EXISTS` ทั้ง 8 ตาราง + `CREATE INDEX` — เรียกครั้งเดียวตอนแอปเปิด |
| `seedDb(db)` | ใส่หมวดหมู่/เมนู/ตัวเลือก/โต๊ะตั้งต้น เช็คก่อนว่ามีข้อมูลแล้วหรือยังกันใส่ซ้ำ — มี guard ถ้าสะกด `category`/`itemName` ผิดจะ throw error บอกชัดเจน |
| `resetSalesData(db)` | ลบ `bills` ทั้งหมด (ตารางลูกอย่าง `order_rounds`/`order_items` หายตามเพราะ `ON DELETE CASCADE`) — ผูกกับปุ่ม "ล้างข้อมูลการขาย" ใน `Select_Table.js` แล้ว |

ตัวแปร seed ข้างในไฟล์ (แก้ตรงนี้ถ้าจะเปลี่ยนเมนู/ราคา/โต๊ะ): `CATEGORY_SEED`, `MENU_ITEM_SEED`, `MENU_OPTION_SEED`, `TABLE_SEED`

### `queries_customer/tables.js` — โต๊ะ + สถานะบิล

| export | รับ | คืนค่า/ทำอะไร |
|---|---|---|
| `getTablesWithStatus(db)` | - | โต๊ะทั้งหมด + บิลที่เปิดอยู่ (ถ้ามี) + จำนวนรอบ + ยอดรวม ต่อโต๊ะ (`LEFT JOIN`) |
| `openNewBill(db, tableId)` | table id | `INSERT` บิลใหม่ คืน `bill_id` ที่สร้าง |

### `queries_customer/menu.js` — หมวดหมู่ + เมนู

| export | รับ | คืนค่า/ทำอะไร |
|---|---|---|
| `getCategoriesWithCounts(db)` | - | หมวดหมู่ทั้งหมด + จำนวนเมนูในแต่ละหมวด |
| `getMenuItems(db, { categoryId, search, onlyAvailable })` | หมวด/คำค้น/toggle | เมนูที่กรองแล้วของหมวดนั้น |
| `getMenuItemDetail(db, itemId)` | item id | `{ item, options }` — เมนู 1 รายการ + ตัวเลือกย่อยทั้งหมด (แยกกลุ่ม `ขนาด`/`เพิ่มเติม` ด้วย `group_name`/`selection_type`) |

### `queries_customer/orders.js` — รอบการสั่ง + รายการที่สั่ง

| export | รับ | คืนค่า/ทำอะไร |
|---|---|---|
| `getKitchenQueueCount(db)` | - | จำนวน "จาน" ที่ยังไม่เสิร์ฟทั้งระบบ (`SUM(quantity)` ของ `order_items` ที่ `pending`/`cooking` — นับตามปริมาณจริง ไม่ใช่นับจำนวนแถว) |
| `getBillRoundCount(db, billId)` | bill id | จำนวนรอบที่ส่งครัวไปแล้วของบิลนั้น (ใช้แค่โชว์ผล ไม่ใช้คำนวณ round_number จริงแล้ว) |
| `getPreviousRoundsSummary(db, billId)` | bill id | รายการ `[{round_number, total_satang}]` ของรอบก่อนหน้าที่ส่งไปแล้ว (คำนวณด้วย SQL `SUM`) |
| `submitOrderRound(db, { billId, cart })` | bill id + ตะกร้า | **ทรานแซกชันเดียว**: คำนวณ `round_number` ถัดไปเองจาก DB → insert `order_rounds` → insert `order_items` ทีละรายการ → insert `order_item_options` ของแต่ละรายการ คืนค่า `round_number` ที่ insert ไปจริง |

---

## `src/context/CartContext.js` — ตะกร้ารอบปัจจุบัน

`CartProvider` ครอบทั้งแอปใน `App.js` เก็บ state เดียว `cart` (array) — แต่ละ entry มีรูปแบบ:
```js
{
  item_id, name, unit_price_satang, quantity, note,
  options: [{ option_id, name, price_delta_satang }]
}
```
`useCart()` คืนค่า `{ cart, addToCart, removeFromCart, updateQuantity, clearCart }` ให้หน้าจอไหนก็เรียกใช้ได้ ไม่ต้องส่งผ่าน navigation params

---

## หน้าจอ (`src/screens/customer/`)

### `Select_Table.js`

| ตัวแปร/state | คืออะไร |
|---|---|
| `tables` | ผลลัพธ์จาก `getTablesWithStatus` (โต๊ะ+สถานะบิล) |
| `selectedTableId` | โต๊ะที่แตะเลือกไว้ (ยังไม่กดยืนยัน) |
| `kitchenQueueCount` | จำนวนคิวครัวปัจจุบัน โชว์ในแผงซ้าย |
| `isTableBusy(t)` | ฟังก์ชัน — โต๊ะนับว่า "มีบิลค้าง" ก็ต่อเมื่อมีบิลเปิด **และ** สั่งไปแล้วอย่างน้อย 1 รอบ (บิลเปิดเปล่าๆ ไม่นับ) |
| `formatBangkokHM` / `getBangkokNow` / `formatThaiDate` | แปลงเวลา UTC จาก SQLite → เวลาไทย (+7 ชม.) ไม่พึ่ง timezone ของเครื่อง |

### `Menu_Screen.js`

| ตัวแปร/state | คืออะไร |
|---|---|
| `categories` / `selectedCategoryId` | รายการหมวดหมู่ฝั่งซ้าย + หมวดที่เลือกอยู่ |
| `searchText` / `onlyAvailable` | ค้นหา + toggle กรองของหมด |
| `menuItems` | เมนูของหมวดที่เลือก (กรองแล้ว) |
| `cart` (จาก `useCart()`) | ตะกร้ารอบนี้ |
| `roundCount` | จำนวนรอบที่ส่งไปแล้วของบิลนี้ (ใช้โชว์ "ตะกร้ารอบที่ N") |
| `roundTotal` | ยอดรวมตะกร้า **ปัจจุบัน** (คำนวณด้วย JS `.reduce()` ได้ เพราะยังไม่มีอยู่ใน DB) |

กด "+" ที่การ์ดเมนู → navigate ไป `ItemDetailScreen` (ไม่ได้เพิ่มลงตะกร้าตรงๆ)

### `Item_Detail_Screen.js` (modal — เลือกตัวเลือก/จำนวน/หมายเหตุ)

| ตัวแปร/state | คืออะไร |
|---|---|
| `item` / `options` | เมนู + ตัวเลือกทั้งหมดจาก `getMenuItemDetail` |
| `selectedSizeOptionId` | ตัวเลือกกลุ่ม "ขนาด" ที่เลือก (เลือกได้ 1) |
| `selectedAddonIds` | ตัวเลือกกลุ่ม "เพิ่มเติม" ที่เลือก (เลือกได้หลายอัน) |
| `note` / `quantity` | หมายเหตุถึงครัว + จำนวน |
| `unitTotal` / `grandTotal` | ราคาต่อหน่วย/รวม (คำนวณสดจากตัวเลือกที่เลือก) |

กด "เพิ่มลงตะกร้า" → เรียก `addToCart()` จาก Context ตรงๆ แล้ว `goBack()`

### `Review_Screen.js` (ตรวจก่อนส่งครัว)

| ตัวแปร/state | คืออะไร |
|---|---|
| `cart` / `updateQuantity` / `clearCart` (จาก `useCart()`) | แก้จำนวน/ล้างตะกร้าได้จากหน้านี้ |
| `previousRounds` | รอบก่อนหน้าที่ส่งไปแล้ว จาก `getPreviousRoundsSummary` |
| `submitting` | กันกดปุ่ม "ส่งเข้าครัว" ซ้ำระหว่างรอ |
| `roundTotal` / `totalPieces` / `previousTotal` / `grandTotal` | ยอดต่างๆ ที่โชว์ฝั่งขวา |

กด "ส่งเข้าครัว" → `submitOrderRound()` (ทรานแซกชัน) → `clearCart()` → `goBack()` (ใช้ `goBack` ไม่ใช้ `navigate` เพราะรู้ตำแหน่งแน่นอนในสแตก)

---

## `src/screens/customer/style/colors.js`

ชุดสีกลางของทั้งแอป แบ่งกลุ่ม `core` (สีหลัก), `surface` (พื้นผิวการ์ด/แผง), `text` (โทนตัวหนังสือ), `orange`/`mustard`/`red` (สถานะ), `chart`/`placeholder` (กราฟ/รูป placeholder) + `withAlpha()`/`alpha` สำหรับสีโปร่งใส — ทุกหน้าจอ import จากไฟล์เดียวนี้ ห้าม hardcode สี hex ใหม่ในไฟล์อื่น

## `src/screens/customer/menuImages.js`

`MENU_IMAGES` — map ชื่อเมนู → รูปที่ bundle มากับแอป (`require(...)`) ไม่ได้เก็บรูปใน DB ดูวิธีเพิ่มรูปใหม่ในคอมเมนต์บนสุดของไฟล์
