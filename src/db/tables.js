// src/db/tables.js
// query ที่เกี่ยวกับโต๊ะ + สถานะบิลเปิด สำหรับหน้าเลือกโต๊ะ

export async function getTablesWithStatus(db) {
  return db.getAllAsync(`
    SELECT t.table_id, t.table_number, t.seats, b.bill_id, b.opened_at,
           COUNT(DISTINCT r.round_id) AS round_count,
           COALESCE(SUM(oi.unit_price_satang * oi.quantity), 0) AS total_satang
    FROM restaurant_tables t
    LEFT JOIN bills b ON b.table_id = t.table_id AND b.status = 'open'
    LEFT JOIN order_rounds r ON r.bill_id = b.bill_id
    LEFT JOIN order_items oi ON oi.round_id = r.round_id AND oi.status != 'cancelled'
    GROUP BY t.table_id
    ORDER BY t.table_number
  `);
}

// เปิดบิลใหม่ให้โต๊ะที่ยังไม่มีบิลเปิดอยู่ — คืนค่า bill_id ที่เพิ่งสร้าง
export async function openNewBill(db, tableId) {
  const result = await db.runAsync(
    'INSERT INTO bills (table_id) VALUES (?)',
    [tableId]
  );
  return result.lastInsertRowId;
}
