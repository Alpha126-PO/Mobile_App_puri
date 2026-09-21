import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DATABASE_NAME, initDb, seedDb } from './src/db/db';
import { CartProvider } from './src/context/CartContext';
import SelectTable from './src/screens/customer/Select_Table';
import MenuScreen from './src/screens/customer/Menu_Screen';
import ReviewScreen from './src/screens/customer/Review_Screen';
import ItemDetailScreen from './src/screens/customer/Item_Detail_Screen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SQLiteProvider
      databaseName={DATABASE_NAME}
      onInit={async (db) => {
        await initDb(db);
        await seedDb(db);
      }}
    >
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="SelectTable" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SelectTable" component={SelectTable} />
            <Stack.Screen name="MenuScreen" component={MenuScreen} />
            <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
            <Stack.Screen
              name="ItemDetailScreen"
              component={ItemDetailScreen}
              options={{ presentation: 'transparentModal', animation: 'fade' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </SQLiteProvider>
  );
}
