import {useCallback, useEffect} from 'react';
import {useFocusEffect} from '@react-navigation/native';

export const useRefreshOnFocus = (callback) => {
  useFocusEffect(
    useCallback(() => {
      callback();
    }, [callback]),
  );
}; 