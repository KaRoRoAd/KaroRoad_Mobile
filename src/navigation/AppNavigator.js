import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LoginScreen from '../components/LoginScreen';
import Register from '../components/Register';
import ResetPasswordScreen from '../components/ResetPasswordScreen';
import ChangePasswordScreen from '../components/ChangePasswordScreen';
import HelloWorldScreen from '../components/HelloWorldScreen';
import MeetScreen from '../components/MeetScreen';
import MeetUsersScreen from '../components/MeetUsersScreen';
import FirmScreen from '../components/FirmScreen';
import TaskScreen from '../components/TaskScreen';
import CreateMeetScreen from '../components/CreateMeetScreen';
import CreateFirmScreen from '../components/CreateFirmScreen';
import CreateTaskScreen from '../components/CreateTaskScreen';
import EditTaskScreen from '../components/EditTaskScreen';
import EditMeetScreen from '../components/EditMeetScreen';
import FirmManagementScreen from '../components/FirmManagementScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen 
          name="Register" 
          component={Register}
          options={{title: 'Rejestracja'}}
        />
        <Stack.Screen 
          name="ResetPassword" 
          component={ResetPasswordScreen}
          options={{title: 'Resetuj hasło'}}
        />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePasswordScreen}
          options={{title: 'Zmień hasło'}}
        />
        <Stack.Screen 
          name="HelloWorld" 
          component={HelloWorldScreen}
          options={{
            title: 'Menu główne',
            headerLeft: () => null,
          }}
        />
        <Stack.Screen 
          name="Meet" 
          component={MeetScreen}
          options={{title: 'Spotkania'}}
        />
        <Stack.Screen 
          name="MeetUsers" 
          component={MeetUsersScreen}
          options={{title: 'Uczestnicy spotkania'}}
        />
        <Stack.Screen 
          name="CreateMeet" 
          component={CreateMeetScreen}
          options={{title: 'Nowe spotkanie'}}
        />
        <Stack.Screen 
          name="Firm" 
          component={FirmScreen}
          options={{title: 'Firmy'}}
        />
        <Stack.Screen 
          name="CreateFirm" 
          component={CreateFirmScreen}
          options={{title: 'Nowa firma'}}
        />
        <Stack.Screen 
          name="FirmManagement" 
          component={FirmManagementScreen}
          options={{title: 'Zarządzanie pracownikami'}}
        />
        <Stack.Screen 
          name="Task" 
          component={TaskScreen}
          options={{title: 'Zadania'}}
        />
        <Stack.Screen 
          name="CreateTask" 
          component={CreateTaskScreen}
          options={{title: 'Nowe zadanie'}}
        />
        <Stack.Screen 
          name="EditTask" 
          component={EditTaskScreen}
          options={{title: 'Edytuj zadanie'}}
        />
        <Stack.Screen 
          name="EditMeet" 
          component={EditMeetScreen}
          options={{title: 'Edytuj spotkanie'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 