import { View, Text, StyleSheet, TextInput, Switch, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';

const orders = [
  {
    round: 1, sentTime: '18:12', status: 'เสิร์ฟครบ',
    items: [
      { id: '1', name: 'ข้าวผัดกุ้ง', note: 'ธรรมดา', price: 120, qty: 2 },
      { id: '2', name: 'คะน้าน้ำมันหอย', note: 'ใส่หมูกรอบ', price: 105, qty: 1 },
    ]
  },
  {
    round: 2, sentTime: '18:52', status: 'กำลังทำ',
    items: [
      { id: '3', name: 'ผัดกะเพราหมูสับ', note: 'พิเศษ, ไข่ดาว', price: 120, qty: 2 },
      { id: '4', name: 'ข้าวสวย', note: '', price: 15, qty: 4 },
    ]
  },
  {
    round: 3, sentTime: '18:52', status: 'กำลังทำ',
    items: [
      { id: '5', name: 'ผัดกะเพราหมูสับ', note: 'พิเศษ, ไข่ดาว', price: 120, qty: 2 },
      { id: '6', name: 'ข้าวสวย', note: '', price: 15, qty: 4 },
    ]
  },{
    round: 4, sentTime: '18:52', status: 'กำลังทำ',
    items: [
      { id: '5', name: 'ผัดกะเพราหมูสับ', note: 'พิเศษ, ไข่ดาว', price: 120, qty: 2 },
      { id: '6', name: 'ข้าวสวย', note: '', price: 15, qty: 4 },
    ]
  },{
    round: 5, sentTime: '18:52', status: 'กำลังทำ',
    items: [
      { id: '5', name: 'ผัดกะเพราหมูสับ', note: 'พิเศษ, ไข่ดาว', price: 120, qty: 2 },
      { id: '6', name: 'ข้าวสวย', note: '', price: 15, qty: 4 },
    ]
  },{
    round: 6, sentTime: '18:52', status: 'กำลังทำ',
    items: [
      { id: '5', name: 'ผัดกะเพราหมูสับ', note: 'พิเศษ, ไข่ดาว', price: 120, qty: 2 },
      { id: '6', name: 'ข้าวสวย', note: '', price: 15, qty: 4 },
    ]
  },
];

const FORMAT_OPTIONS = [
  { id: 'pdf_a5', label: 'PDF A5 (ใบเสร็จเต็ม)', size: '~120 KB' },
  { id: 'pdf_slip', label: 'PDF สลิป 80 มม.', size: '~60 KB' },
  { id: 'png', label: 'รูปภาพ PNG', size: '~340 KB' },
];

function Row({ label, value, bold, labelStyle }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
      <Text style={[styles.rowText, bold && styles.rowBold, labelStyle]}>{label}</Text>
      <Text style={[styles.rowText, bold && styles.rowBold]}>{value}</Text>
    </View>
  );
}

export default function ExportBillScreen({navigation}) {
  const [selectedFormat, setSelectedFormat] = useState('pdf_a5');
  const [email, setEmail] = useState('');
  const [fullTax, setFullTax] = useState(false);

  const subtotal = orders.reduce((sum, round) =>
    sum + round.items.reduce((s, item) => s + item.price * item.qty, 0), 0
  );
  const discount = Math.round(subtotal * 0.05);
  const service = Math.round(subtotal * 0.10);
  const vat = Math.round(subtotal * 0.07);
  const total = subtotal - discount + service + vat;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.row}>

        {/* ใบเสร็จ */}
        <View style={styles.receipt}>
          <Text style={styles.shopName}>ครัวป้าน้อย</Text>
          <Text style={styles.shopSub}>123 ถ.นิมมานเหมินท์ เชียงใหม่</Text>
          <Text style={styles.shopSub}>TAX ID 0505561000000</Text>

          <View style={styles.dividerDash} />

          <Row label="BILL" value="#A-1042" />
          <Row label="TABLE" value="T5" />
          <Row label="16/09/2026" value="18:12 – 20:04" />

          <View style={styles.dividerDash} />

          {orders.map((round) => (
            <View key={round.round}>
              <Row
                label={`ROUND ${round.round}`}
                value={round.sentTime}
                labelStyle={styles.roundLabel}
              />
              {round.items.map((item) => (
                <Row
                  key={item.id}
                  label={`${item.name}  ×${item.qty}`}
                  value={(item.price * item.qty).toString()}
                />
              ))}
              <View style={{ height: 8 }} />
            </View>
          ))}

          <View style={styles.dividerDash} />

          <Row label="SUBTOTAL" value={subtotal.toLocaleString()} />
          <Row label="DISCOUNT 5%" value={`-${discount}`} />
          <Row label="SERVICE 10%" value={service.toString()} />
          <Row label="VAT 7%" value={vat.toString()} />

          <View style={styles.dividerSolid} />

          <Row label="TOTAL" value={`฿${total.toLocaleString()}`} bold />

          <View style={{ height: 32 }} />
          <Text style={styles.footer}>ขอบคุณที่มาทานค่ะ</Text>
          <Text style={styles.footer}>ใบเสร็จนี้ออกจากระบบอัตโนมัติ</Text>
        </View>

        {/* Export panel */}
        <View style={styles.exportPanel}>
          <Text style={styles.exportTitle}>บันทึกใบเสร็จ</Text>
          <Text style={styles.exportSub}>เลือกรูปแบบไฟล์ ระบบจะสร้างไฟล์ให้ดาวน์โหลดหรือส่งเข้าอีเมล</Text>

          <View style={{ gap: 12, marginTop: 20 }}>
            {FORMAT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() => setSelectedFormat(opt.id)}
                style={[styles.formatOption, selectedFormat === opt.id && styles.formatOptionSelected]}
              >
                <View style={[styles.radio, selectedFormat === opt.id && styles.radioSelected]}>
                  {selectedFormat === opt.id && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.formatLabel, selectedFormat === opt.id && { color: '#2D5A3D' }]}>
                  {opt.label}
                </Text>
                <Text style={styles.formatSize}>{opt.size}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>ส่งเข้าอีเมล (ถ้าต้องการ)</Text>
          <TextInput
            style={styles.input}
            placeholder="you@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <View style={[styles.formatOption, { marginTop: 12 }]}>
            <Text style={[styles.formatLabel, { flex: 1 }]}>ขอใบกำกับภาษีเต็มรูป</Text>
            <Switch
              value={fullTax}
              onValueChange={setFullTax}
              trackColor={{ true: '#2D5A3D' }}
            />
          </View>

          <Pressable style={styles.btnExport}>
            <Text style={styles.btnText}>สร้างไฟล์ใบเสร็จ</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Detail' )}>
                     <Text style={styles.backLink}>กลับไปหน้าสรุปบิล</Text>
          </Pressable>

        
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F0E9' },
  row: { flexDirection: 'row', padding: 24, gap: 24 },

  // Receipt
  receipt: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16,
    padding: 24, alignSelf: 'flex-start',
  },
  shopName: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  shopSub: { fontSize: 13, color: '#666', textAlign: 'center' },
  dividerDash: {
    borderBottomWidth: 1, borderBottomColor: '#ccc',
    borderStyle: 'dashed', marginVertical: 12,
  },
  dividerSolid: { borderBottomWidth: 1, borderBottomColor: '#333', marginVertical: 12 },
  rowText: { fontSize: 14, color: '#333' },
  rowBold: { fontWeight: 'bold', fontSize: 16 },
  roundLabel: { color: '#888', fontSize: 12, letterSpacing: 1 },
  footer: { fontSize: 12, color: '#aaa', textAlign: 'center' },

  // Export panel
  exportPanel: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16,
    padding: 24, alignSelf: 'flex-start',
  },
  exportTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  exportSub: { fontSize: 14, color: '#666' },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginTop: 24, marginBottom: 8 },
  formatOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#E0EDE4', borderRadius: 12, padding: 16,
  },
  formatOptionSelected: { borderColor: '#2D5A3D', backgroundColor: '#F0F7F2' },
  formatLabel: { flex: 1, fontSize: 16 },
  formatSize: { fontSize: 13, color: '#999' },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: '#ccc', alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: '#2D5A3D' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2D5A3D' },
  input: {
    borderWidth: 1, borderColor: '#E0EDE4', borderRadius: 10,
    padding: 14, fontSize: 15,
  },
  btnExport: {
    backgroundColor: '#1C2E23', borderRadius: 14,
    padding: 18, alignItems: 'center', marginTop: 20,
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  backLink: { textAlign: 'center', marginTop: 16, color: '#666', fontSize: 14 },
});