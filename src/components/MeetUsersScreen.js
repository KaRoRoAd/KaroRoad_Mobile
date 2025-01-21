import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import {
  getMeetUsers,
  addUserToMeet,
  deleteUserFromMeet,
} from '../services/meetManagement';

const MeetUsersScreen = ({navigation, route}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const meetId = route.params?.meetId;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMeetUsers(meetId);
      setUsers(response.member || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        Alert.alert('Błąd', 'Sesja wygasła. Zaloguj się ponownie.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Błąd', 'Nie udało się pobrać użytkowników');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation, meetId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      Alert.alert('Błąd', 'Wprowadź adres email użytkownika');
      return;
    }

    try {
      await addUserToMeet(meetId, newUserEmail.trim());
      Alert.alert('Sukces', 'Użytkownik został dodany do spotkania');
      setNewUserEmail('');
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      Alert.alert('Błąd', 'Nie udało się dodać użytkownika');
    }
  };

  const handleDeleteUser = async (userId) => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz usunąć tego użytkownika ze spotkania?',
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
              await deleteUserFromMeet(userId);
              Alert.alert('Sukces', 'Użytkownik został usunięty ze spotkania');
              fetchUsers();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Błąd', 'Nie udało się usunąć użytkownika');
            }
          },
        },
      ],
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.addUserContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email użytkownika"
          value={newUserEmail}
          onChangeText={setNewUserEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <Text style={styles.addButtonText}>Dodaj</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteUser(item.id)}>
              <Text style={styles.deleteButtonText}>Usuń</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Brak uczestników spotkania</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addUserContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
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
});

export default MeetUsersScreen; 