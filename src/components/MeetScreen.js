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
import {Calendar} from 'react-native-calendars';
import axios from 'axios';
import {API_URL} from '../services/api';
import {getAuthHeader} from '../services/auth';

const MeetScreen = ({navigation}) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState({});

  const fetchMeetings = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/meet`, {
        headers: {
          'Content-Type': 'application/ld+json',
          ...getAuthHeader(),
        },
      });
      const fetchedMeetings = response.data['member'];
      setMeetings(fetchedMeetings);
      
      // Update marked dates for the calendar
      const marks = {};
      fetchedMeetings.forEach(meet => {
        const startDate = new Date(meet.startDate).toISOString().split('T')[0];
        const endDate = new Date(meet.endDate).toISOString().split('T')[0];
        
        // Mark start date
        marks[startDate] = {
          marked: true,
          dotColor: '#007AFF',
        };
        
        // If meeting ends on a different day, mark end date too
        if (startDate !== endDate) {
          marks[endDate] = {
            marked: true,
            dotColor: '#007AFF',
          };
        }
      });
      setMarkedDates(marks);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      if (error.response?.status === 401) {
        Alert.alert('Błąd', 'Sesja wygasła. Zaloguj się ponownie.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Błąd', 'Nie udało się pobrać spotkań');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMeetings();
  }, [fetchMeetings]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredMeetings = meetings.filter(meet => {
    const startDate = new Date(meet.startDate).toISOString().split('T')[0];
    const endDate = new Date(meet.endDate).toISOString().split('T')[0];
    return startDate === selectedDate || endDate === selectedDate;
  });

  const handleDeleteMeeting = async (meetingId) => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz usunąć to spotkanie?',
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
              await axios.delete(`${API_URL}/meet/${meetingId}`, {
                headers: {
                  'Content-Type': 'application/ld+json',
                  ...getAuthHeader(),
                },
              });
              fetchMeetings();
              Alert.alert('Sukces', 'Spotkanie zostało usunięte');
            } catch (error) {
              console.error('Error deleting meeting:', error);
              if (error.response?.status === 401) {
                Alert.alert('Błąd', 'Sesja wygasła. Zaloguj się ponownie.');
                navigation.navigate('Login');
              } else {
                Alert.alert('Błąd', 'Nie udało się usunąć spotkania');
              }
            }
          },
        },
      ],
    );
  };

  const handleEditMeeting = (meeting) => {
    navigation.navigate('EditMeet', {
      meeting,
      onMeetingUpdated: fetchMeetings,
    });
  };

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

      <View style={styles.meetingListContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.dateHeader}>
            {new Date(selectedDate).toLocaleDateString('pl-PL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => 
              navigation.navigate('CreateMeet', {
                onMeetingCreated: fetchMeetings,
                selectedDate: selectedDate,
              })
            }>
            <Text style={styles.addButtonText}>+ Dodaj spotkanie</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredMeetings}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Brak spotkań na ten dzień</Text>
            </View>
          )}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={styles.meetingCard}
              onPress={() => {
                Alert.alert(
                  'Spotkanie',
                  `${item.name}`,
                  [
                    {
                      text: 'Anuluj',
                      style: 'cancel',
                    },
                    {
                      text: 'Edytuj',
                      onPress: () => handleEditMeeting(item),
                    },
                    {
                      text: 'Usuń',
                      style: 'destructive',
                      onPress: () => handleDeleteMeeting(item.id),
                    },
                  ],
                );
              }}>
              <Text style={styles.meetingName}>{item.name}</Text>
              <View style={styles.timeContainer}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>Od:</Text>
                  <Text style={styles.timeText}>{formatDateTime(item.startDate)}</Text>
                </View>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>Do:</Text>
                  <Text style={styles.timeText}>{formatDateTime(item.endDate)}</Text>
                </View>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.usersButton]}
                  onPress={() => navigation.navigate('MeetUsers', { meetId: item.id })}>
                  <Text style={styles.actionButtonText}>Uczestnicy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditMeeting(item)}>
                  <Text style={styles.actionButtonText}>Edytuj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteMeeting(item.id)}>
                  <Text style={styles.actionButtonText}>Usuń</Text>
                </TouchableOpacity>
              </View>
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
  meetingListContainer: {
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
  meetingCard: {
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
  meetingName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeBlock: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  usersButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MeetScreen; 