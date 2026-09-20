// src/db/orders.js
// query ที่เกี่ยวกับรายการที่สั่ง (order_items) — ใช้ร่วมกันได้ทั้งฝั่งลูกค้าและฝั่งครัว

// จำนวนรายการที่ครัวยังไม่เสิร์ฟ (รอทำ + กำลังทำ) ใช้โชว์เป็น "คิวครัว"
export async function getKitchenQueueCount(db) {
  const row = await db.getFirstAsync(
    `SELECT COUNT(*) AS count
     FROM order_items
     WHERE status IN ('pending', 'cooking')`
  );
  return row?.count ?? 0;
}
// เอาไว้นับรอบบิล
export async function getBillRoundCount(db, billId) {
  const row = await db.getFirstAsync(`
    SELECT COUNT(*) AS count FROM order_rounds WHERE bill_id = ?
  `, [billId]);
  return row?.count ?? 0;
  
}