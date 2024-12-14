import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import LoginScreen from './src/components/LoginScreen';
import HelloWorldScreen from './src/components/HelloWorldScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="HelloWorld" component={HelloWorldScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
