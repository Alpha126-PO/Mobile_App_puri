import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DATABASE_NAME, initDb, seedDb } from './src/db/db';
import SelectTable from './src/screens/customer/Select_Table';
import MenuScreen from './src/screens/customer/Menu_Screen';

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
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SelectTable" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SelectTable" component={SelectTable} />
          <Stack.Screen name="MenuScreen" component={MenuScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}
