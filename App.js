import React, {useEffect} from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import notifee, {AuthorizationStatus} from '@notifee/react-native';

const App = () => {
  useEffect(() => {
    const requestNotificationPermission = async () => {
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        console.log('Permission granted');
      } else {
        console.log('Permission denied');
      }
    };

    requestNotificationPermission();
  }, []);

  return <AppNavigator />;
};

export default App;
