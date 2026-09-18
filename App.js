import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      
      <View style={{ flex: 4, backgroundColor: 'lightblue' }}>
        <Text>40%</Text>
      </View>

      <View style={{ flex: 6, backgroundColor: 'lightgreen' }}>
        <Text>50%</Text>
      </View>

      

  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  // ← ทำให้เต็มจอ
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conntent :{
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
   
  }
});