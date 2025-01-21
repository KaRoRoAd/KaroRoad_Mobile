import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import {API_URL} from '../services/api';
import {getAuthHeader} from '../services/auth';
import {scheduleMeetingNotification} from '../services/notifications';

const EditMeetScreen = ({navigation, route}) => {
  const meeting = route.params.meeting;
  const [name, setName] = useState(meeting.name);
  const [startDate, setStartDate] = useState(new Date(meeting.startDate));
  const [endDate, setEndDate] = useState(new Date(meeting.endDate));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const onStartChange = (event, selectedDate) => {
    if (selectedDate) {
      setStartDate(selectedDate);
      if (endDate < selectedDate) {
        setEndDate(new Date(selectedDate.getTime() + 3600000));
      }
    }
  };

  const onEndChange = (event, selectedDate) => {
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Błąd', 'Nazwa spotkania jest wymagana');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Błąd', 'Data zakończenia musi być późniejsza niż data rozpoczęcia');
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/meet/${meeting.id}`,
        {
          name: name.trim(),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        {
          headers: {
            'Content-Type': 'application/ld+json',
            ...getAuthHeader(),
          },
        },
      );

      await scheduleMeetingNotification({
        name: name.trim(),
        startDate: startDate,
      });

      Alert.alert('Sukces', 'Spotkanie zostało zaktualizowane', [
        {
          text: 'OK',
          onPress: () => {
            if (route.params?.onMeetingUpdated) {
              route.params.onMeetingUpdated();
            }
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Error updating meeting:', error);
      if (error.response?.status === 401) {
        Alert.alert('Błąd', 'Sesja wygasła. Zaloguj się ponownie.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Błąd', 'Nie udało się zaktualizować spotkania');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderDatePicker = (isStartDate) => {
    const currentDate = isStartDate ? startDate : endDate;
    const onChange = isStartDate ? onStartChange : onEndChange;
    const setShow = isStartDate ? setShowStartPicker : setShowEndPicker;

    if (Platform.OS === 'ios') {
      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isStartDate ? showStartPicker : showEndPicker}>
          <View style={styles.modalContainer}>
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.cancelButton}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShow(false);
                  }}>
                  <Text style={styles.doneButton}>Gotowe</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={currentDate}
                mode="datetime"
                is24Hour={true}
                display="spinner"
                onChange={onChange}
                style={styles.dateTimePicker}
                minimumDate={isStartDate ? new Date() : startDate}
              />
            </SafeAreaView>
          </View>
        </Modal>
      );
    }

    return showStartPicker || showEndPicker ? (
      <DateTimePicker
        value={currentDate}
        mode="datetime"
        is24Hour={true}
        display="default"
        onChange={(event, date) => {
          setShow(false);
          onChange(event, date);
        }}
        minimumDate={isStartDate ? new Date() : startDate}
      />
    ) : null;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edytuj spotkanie</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nazwa spotkania"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowStartPicker(true)}>
        <Text style={styles.dateButtonText}>Data rozpoczęcia:</Text>
        <Text style={styles.dateText}>{formatDate(startDate)}</Text>
      </TouchableOpacity>

      {renderDatePicker(true)}

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowEndPicker(true)}>
        <Text style={styles.dateButtonText}>Data zakończenia:</Text>
        <Text style={styles.dateText}>{formatDate(endDate)}</Text>
      </TouchableOpacity>

      {renderDatePicker(false)}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}>
        <Text style={styles.submitButtonText}>
          {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color="#007AFF"
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  dateText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cancelButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  doneButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateTimePicker: {
    height: 200,
    width: '100%',
  },
});

export default EditMeetScreen; 