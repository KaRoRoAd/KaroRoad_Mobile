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
import {scheduleTaskNotification} from '../services/notifications';

const EditTaskScreen = ({navigation, route}) => {
  const task = route.params.task;
  const [name, setName] = useState(task.name);
  const [employeeId, setEmployeeId] = useState(task.employeeId.toString());
  const [status, setStatus] = useState(task.status);
  const [deadLine, setDeadLine] = useState(new Date(task.deadLine));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDeadLine(selectedDate);
    }
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDatePicker}>
          <View style={styles.modalContainer}>
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.cancelButton}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowDatePicker(false);
                  }}>
                  <Text style={styles.doneButton}>Gotowe</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={deadLine}
                mode="datetime"
                is24Hour={true}
                display="spinner"
                onChange={onDateChange}
                style={styles.dateTimePicker}
                minimumDate={new Date()}
              />
            </SafeAreaView>
          </View>
        </Modal>
      );
    }

    return showDatePicker ? (
      <DateTimePicker
        value={deadLine}
        mode="datetime"
        is24Hour={true}
        display="default"
        onChange={(event, date) => {
          setShowDatePicker(false);
          onDateChange(event, date);
        }}
        minimumDate={new Date()}
      />
    ) : null;
  };

  const handleSubmit = async () => {
    if (!name.trim() || !employeeId) {
      Alert.alert('Błąd', 'Wszystkie pola są wymagane');
      return;
    }

    if (isNaN(parseInt(employeeId, 10))) {
      Alert.alert('Błąd', 'ID pracownika musi być liczbą');
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/task/${task.id}`,
        {
          name: name.trim(),
          deadLine: deadLine.toISOString(),
          employeeId: parseInt(employeeId, 10),
          status: status,
        },
        {
          headers: {
            'Content-Type': 'application/ld+json',
            ...getAuthHeader(),
          },
        },
      );

      await scheduleTaskNotification({
        name: name.trim(),
        deadLine: deadLine,
      });

      Alert.alert('Sukces', 'Zadanie zostało zaktualizowane', [
        {
          text: 'OK',
          onPress: () => {
            if (route.params?.onTaskUpdated) {
              route.params.onTaskUpdated();
            }
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Error updating task:', error);
      if (error.response?.status === 401) {
        Alert.alert('Błąd', 'Sesja wygasła. Zaloguj się ponownie.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Błąd', 'Nie udało się zaktualizować zadania');
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edytuj zadanie</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nazwa zadania"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="ID pracownika"
        value={employeeId}
        onChangeText={setEmployeeId}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateButtonText}>Termin wykonania:</Text>
        <Text style={styles.dateText}>
          {formatDate(deadLine)}
        </Text>
      </TouchableOpacity>

      {renderDatePicker()}

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

export default EditTaskScreen; 