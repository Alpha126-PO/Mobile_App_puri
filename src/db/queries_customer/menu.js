export async function getCategoriesWithCounts(db) {
    return db.getAllAsync(`
      SELECT c.category_id, c.name,
             COUNT(m.item_id) AS item_count
      FROM categories c
      LEFT JOIN menu_items m ON m.category_id = c.category_id
      GROUP BY c.category_id
      ORDER BY c.category_id
    `);
  }
  export async function getMenuItems(db, { categoryId, search, onlyAvailable }) {
    return db.getAllAsync(
      `SELECT item_id, name, price_satang, is_available
       FROM menu_items
       WHERE category_id = ?
         AND name LIKE ?
         AND (? = 0 OR is_available = 1)`,
      [categoryId, `%${search}%`, onlyAvailable ? 1 : 0]
    );
  }

  // ดึงเมนู 1 รายการ + ตัวเลือกย่อยทั้งหมดของมัน (สำหรับหน้ารายละเอียด/เพิ่มลงตะกร้า)
  export async function getMenuItemDetail(db, itemId) {
    const item = await db.getFirstAsync(
      'SELECT item_id, name, price_satang FROM menu_items WHERE item_id = ?',
      [itemId]
    );
    const options = await db.getAllAsync(
      `SELECT option_id, name, price_delta_satang, group_name, selection_type, is_available
       FROM menu_options
       WHERE item_id = ?
       ORDER BY option_id`,
      [itemId]
    );
    return { item, options };
  }