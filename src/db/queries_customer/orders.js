// src/db/orders.js
// query ที่เกี่ยวกับรายการที่สั่ง (order_items) — ใช้ร่วมกันได้ทั้งฝั่งลูกค้าและฝั่งครัว

// จำนวน "จาน" ที่ครัวยังไม่เสิร์ฟ (รอทำ + กำลังทำ) ใช้โชว์เป็น "คิวครัว"
// นับตาม quantity ไม่ใช่นับจำนวนแถว — สั่ง 1 เมนู 5 จาน ต้องนับเป็น 5 ไม่ใช่ 1
export async function getKitchenQueueCount(db) {
  const row = await db.getFirstAsync(
    `SELECT COALESCE(SUM(quantity), 0) AS count
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
// ยอดที่ส่งเข้าครัวแล้วในรอบนนั่นๆ
export async function getPreviousRoundsSummary(db, billId) {
  return db.getAllAsync(
    `SELECT r.round_number,
            SUM(oi.unit_price_satang * oi.quantity) AS total_satang
     FROM order_rounds r
     JOIN order_items oi ON oi.round_id = r.round_id AND oi.status != 'cancelled'
     WHERE r.bill_id = ?
     GROUP BY r.round_id
     ORDER BY r.round_number`,
    [billId]
  );
  
}

// ส่งรอบการสั่งเข้าครัว — INSERT ทั้งก้อนในทรานแซกชันเดียว
// round_number คำนวณเองในนี้จาก DB ตรงๆ ไม่รับมาจากภายนอก กัน UI ที่ค่า stale ทำให้ชน UNIQUE
export async function submitOrderRound(db, { billId, cart }) {
  let roundNumber;

  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync(
      'SELECT COALESCE(MAX(round_number), 0) + 1 AS nextRoundNumber FROM order_rounds WHERE bill_id = ?',
      [billId]
    );
    roundNumber = row.nextRoundNumber;

    const roundResult = await db.runAsync(
      'INSERT INTO order_rounds (bill_id, round_number) VALUES (?, ?)',
      [billId, roundNumber]
    );
    const roundId = roundResult.lastInsertRowId;

    for (const c of cart) {
      const itemResult = await db.runAsync(
        `INSERT INTO order_items (round_id, item_id, unit_price_satang, quantity, note)
         VALUES (?, ?, ?, ?, ?)`,
        [roundId, c.item_id, c.unit_price_satang, c.quantity, c.note || null]
      );
      const orderItemId = itemResult.lastInsertRowId;

      for (const o of c.options ?? []) {
        await db.runAsync(
          `INSERT INTO order_item_options
             (order_item_id, option_id, option_name_snapshot, price_delta_satang_snapshot)
           VALUES (?, ?, ?, ?)`,
          [orderItemId, o.option_id, o.name, o.price_delta_satang]
        );
      }
    }
  });

  return roundNumber;
}