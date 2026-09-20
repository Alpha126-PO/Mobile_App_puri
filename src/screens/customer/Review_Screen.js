import { StyleSheet, Text, View } from 'react-native';
import colors from './style/colors';

export default function ReviewScreen({ route }) {
  const { billId, tableId, cart, roundNumber } = route.params ?? {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Screen</Text>
      <Text style={styles.subtitle}>
        tableId: {tableId} · billId: {billId} · round: {roundNumber} · items: {cart?.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.core.screenBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.core.darkGreen,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.text.description,
    fontSize: 14,
    marginTop: 8,
  },
});
