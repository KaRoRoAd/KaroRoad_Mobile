import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import {Calendar, CalendarProvider} from 'react-native-calendars';
import axios from 'axios';
import {API_URL} from '../services/api';
import {getAuthHeader} from '../services/auth';
import {useRefreshOnFocus} from '../hooks/useRefreshOnFocus';

const TaskScreen = ({navigation}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState({});

  const fetchTasks = useCallback(async () => {
    try {
      console.log('Fetching tasks...');
      const response = await axios.get(`${API_URL}/task`, {
        headers: {
          'Content-Type': 'application/ld+json',
          ...getAuthHeader(),
        },
      });
      const fetchedTasks = response.data['member'];
      setTasks(fetchedTasks);
      
      // Update marked dates for the calendar
      const marks = {};
      fetchedTasks.forEach(task => {
        const date = new Date(task.deadLine).toISOString().split('T')[0];
        marks[date] = {
          marked: true,
          dotColor: getStatusColor(task.status),
        };
      });
      setMarkedDates(marks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 401) {
        Alert.alert('Błąd', 'Sesja wygasła. Zaloguj się ponownie.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Błąd', 'Nie udało się pobrać zadań');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Screen focused, refreshing tasks...');
      fetchTasks();
    });
    return unsubscribe;
  }, [navigation, fetchTasks]);

  useEffect(() => {
    console.log('Initial tasks fetch...');
    fetchTasks();
  }, [fetchTasks]);

  useRefreshOnFocus(fetchTasks);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'in_progress':
        return '#2196F3';
      case 'pending':
        return '#FFC107';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Zakończone';
      case 'in_progress':
        return 'W trakcie';
      case 'pending':
        return 'Oczekujące';
      default:
        return status;
    }
  };

  const handleAddTask = () => {
    navigation.navigate('CreateTask', {
      onTaskCreated: fetchTasks,
      selectedDate: selectedDate,
    });
  };

  const handleDeleteTask = async (taskId) => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz usunąć to zadanie?',
      [
        {
          text: 'Anuluj',
          style: 'cancel',
        },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/task/${taskId}`, {
                headers: {
                  'Content-Type': 'application/ld+json',
                  ...getAuthHeader(),
                },
              });
              fetchTasks();
              Alert.alert('Sukces', 'Zadanie zostało usunięte');
            } catch (error) {
              console.error('Error deleting task:', error);
              if (error.response?.status === 401) {
                Alert.alert('Błąd', 'Sesja wygasła. Zaloguj się ponownie.');
                navigation.navigate('Login');
              } else {
                Alert.alert('Błąd', 'Nie udało się usunąć zadania');
              }
            }
          },
        },
      ],
    );
  };

  const handleEditTask = (task) => {
    navigation.navigate('EditTask', {
      task,
      onTaskUpdated: fetchTasks,
    });
  };

  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.deadLine).toISOString().split('T')[0];
    return taskDate === selectedDate;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...markedDates[selectedDate],
            selected: true,
            selectedColor: '#007AFF',
          },
        }}
        theme={{
          todayTextColor: '#007AFF',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#ffffff',
        }}
      />

      <View style={styles.taskListContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.dateHeader}>
            {new Date(selectedDate).toLocaleDateString('pl-PL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Text style={styles.addButtonText}>+ Dodaj zadanie</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Brak zadań na ten dzień</Text>
            </View>
          )}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={styles.taskCard}
              onPress={() => {
                Alert.alert(
                  'Zadanie',
                  `${item.name}\nStatus: ${getStatusText(item.status)}\nTermin: ${new Date(
                    item.deadLine,
                  ).toLocaleDateString('pl-PL')}\nPracownik ID: ${item.employeeId}`,
                  [
                    {
                      text: 'Anuluj',
                      style: 'cancel',
                    },
                    {
                      text: 'Edytuj',
                      onPress: () => handleEditTask(item),
                    },
                    {
                      text: 'Usuń',
                      style: 'destructive',
                      onPress: () => handleDeleteTask(item.id),
                    },
                  ],
                );
              }}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskName}>{item?.name || 'Brak nazwy'}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {backgroundColor: getStatusColor(item?.status)},
                  ]}>
                  <Text style={styles.statusText}>
                    {getStatusText(item?.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.employeeId}>
                ID pracownika: {item?.employeeId || 'Nie przypisano'}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  taskListContainer: {
    flex: 1,
    padding: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {
    gap: 10,
  },
  taskCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  employeeId: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default TaskScreen; 