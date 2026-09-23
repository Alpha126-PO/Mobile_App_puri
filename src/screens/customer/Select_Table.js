import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors, { alpha } from './style/colors';

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

function formatThaiDate(date) {
  const day = THAI_DAYS[date.getDay()];
  const month = THAI_MONTHS[date.getMonth()];
  const buddhistYear = date.getFullYear() + 543;
  const period = date.getHours() < 12 ? 'เช้า' : date.getHours() < 17 ? 'บ่าย' : 'เย็น';
  return `${day} ${date.getDate()} ${month} ${buddhistYear} · รอบ${period}`;
}

function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');

  return (
    <View style={styles.clockBlock}>
      <Text style={styles.clockTime}>{hh}:{mm}</Text>
      <Text style={styles.clockDate}>{formatThaiDate(now)}</Text>
    </View>
  );
}

export default function SelectTable() {
  return (
    <View style={styles.screen}>
      <View style={styles.leftPanel}>
        <View>
          <Text style={styles.kicker}>KRUA PA NOI · TABLE UNIT</Text>
          <Text style={styles.greetingTitle}>สวัสดีครับ{'\n'}เริ่มสั่งได้เลย</Text>
          <Text style={styles.greetingSubtitle}>
            แตะหมายเลขโต๊ะที่คุณนั่งอยู่จากผังด้านขวา แล้วเปิดบิลใหม่หรือเข้าบิลที่ค้างอยู่
          </Text>

          <LiveClock />

          <View style={styles.divider} />
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>โต๊ะว่าง</Text>
              <Text style={styles.statValue}>8</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>มีบิลค้าง</Text>
              <Text style={styles.statValueOrange}>4</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>คิวครัว</Text>
              <Text style={styles.statValue}>6</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.rightPanel}>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  // Layout หลัก
  screen: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 4,
    backgroundColor: colors.core.darkGreen,
    padding: 32,
    justifyContent: 'space-between',
  },
  rightPanel: {
    flex: 6,
    backgroundColor: colors.core.screenBg,
    padding: 32,
  },
  title: {
    color: colors.core.screenBg,
    fontSize: 24,
    fontWeight: 'bold',
  },

  
  // ฝั่งซ้าย — หัวข้อร้าน / คำทักทาย
  kicker: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: alpha.onDarkMin,
  },
  greetingTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: 'bold',
    color: colors.core.screenBg,
    marginTop: 16,
  },
  greetingSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: alpha.onDarkMin,
    marginTop: 12,
  },

  
  // ฝั่งซ้าย — นาฬิกา / วันที่
  clockBlock: {
    marginTop: 32,
  },
  clockTime: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.core.screenBg,
  },
  clockDate: {
    fontSize: 14,
    color: alpha.onDarkMin,
    marginTop: 4,
  },

  // ฝั่งซ้าย — เส้นแบ่ง / ตัวเลขสรุป 3 ช่อง
  divider: {
    height: 1,
    backgroundColor: alpha.onDarkMin,
    marginVertical: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statColumn: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 12,
    color: alpha.onDarkMin,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.core.screenBg,
    marginTop: 4,
  },
  statValueOrange: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.orange.numberOnDark,
    marginTop: 4,
  },

  
  // ฝั่งซ้าย — สถานะเชื่อมต่อ (ล่างสุด)
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.core.brandGreen,
  },
  footerText: {
    fontSize: 12,
    color: alpha.onDarkMin,
  },

  
  // ฝั่งขวา — หัวข้อ + legend
  rightHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rightTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.core.darkGreen,
  },
  rightSubtitle: {
    fontSize: 13,
    color: colors.text.description,
    marginTop: 4,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  legendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface.sidebarCard,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  legendDotAvailable: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.muted5,
  },
  legendDotBusy: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange.brand,
  },
  legendText: {
    fontSize: 13,
    color: colors.text.secondary,
  },

  
  // ฝั่งขวา — กริดโต๊ะ
  gridScroll: {
    flex: 1,
    marginTop: 20,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tableCard: {
    width: '23%',
    minHeight: 140,
    backgroundColor: colors.core.screenBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha.borderMin,
    padding: 16,
    justifyContent: 'space-between',
  },
  tableCardBusy: {
    backgroundColor: colors.orange.bgLight,
    borderColor: alpha.orangeHighlight35,
  },
  tableCardSelected: {
    backgroundColor: colors.surface.statusGreenBg,
    borderColor: colors.core.brandGreen,
    borderWidth: 2,
  },
  tableNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.core.darkGreen,
  },
  tableStatusText: {
    fontSize: 13,
    color: colors.text.label,
    marginTop: 8,
  },
  tableBusyAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.orange.textDark,
  },
  tableBusyRounds: {
    fontSize: 13,
    color: colors.orange.textDark,
    marginTop: 2,
  },
  tableOpenedTime: {
    fontSize: 12,
    color: colors.text.placeholder,
    marginTop: 6,
  },
  tableSelectedLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.core.brandGreen,
  },

  // ฝั่งขวา — แถบปุ่มล่าง
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.core.darkGreen,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: colors.surface.switchOff,
  },
  primaryButtonText: {
    color: colors.core.screenBg,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.core.screenBg,
    borderWidth: 1,
    borderColor: alpha.borderMax,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  secondaryButtonDisabled: {
    borderColor: alpha.borderMin,
  },
  secondaryButtonText: {
    color: colors.core.darkGreen,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonTextDisabled: {
    color: colors.text.placeholder,
  },
});
