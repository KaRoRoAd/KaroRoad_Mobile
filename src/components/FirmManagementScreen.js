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
  getEmployees,
  addEmployeeToFirm,
  deleteEmployeeFromFirm,
  updateEmployeeRole,
} from '../services/firmManagement';

const FirmManagementScreen = ({navigation, route}) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const firmId = route.params?.firmId;

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching employees for firm ID:', firmId);
      const response = await getEmployees(firmId);
      console.log('Employees response:', response);
      setEmployees(response.member || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      console.error('Error details:', error.response?.data);
      if (error.response?.status === 401) {
        Alert.alert('Błąd', 'Sesja wygasła. Zaloguj się ponownie.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Błąd', 'Nie udało się pobrać pracowników');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation, firmId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = async () => {
    if (!newEmployeeEmail.trim()) {
      Alert.alert('Błąd', 'Wprowadź adres email pracownika');
      return;
    }

    try {
      await addEmployeeToFirm(newEmployeeEmail.trim(), firmId);
      Alert.alert('Sukces', 'Pracownik został dodany do firmy');
      setNewEmployeeEmail('');
      fetchEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
      Alert.alert('Błąd', 'Nie udało się dodać pracownika');
    }
  };

  const handleDeleteEmployee = async (email) => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz usunąć tego pracownika z firmy?',
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
              await deleteEmployeeFromFirm(email);
              Alert.alert('Sukces', 'Pracownik został usunięty z firmy');
              fetchEmployees();
            } catch (error) {
              console.error('Error deleting employee:', error);
              Alert.alert('Błąd', 'Nie udało się usunąć pracownika');
            }
          },
        },
      ],
    );
  };

  const handleUpdateRole = async (email) => {
    Alert.alert(
      'Zmień rolę',
      'Wybierz nową rolę dla pracownika',
      [
        {
          text: 'Anuluj',
          style: 'cancel',
        },
        {
          text: 'Manager',
          onPress: async () => {
            try {
              await updateEmployeeRole(email, ['ROLE_MANAGER']);
              Alert.alert('Sukces', 'Rola została zaktualizowana');
              fetchEmployees();
            } catch (error) {
              console.error('Error updating role:', error);
              Alert.alert('Błąd', 'Nie udało się zaktualizować roli');
            }
          },
        },
        {
          text: 'Pracownik',
          onPress: async () => {
            try {
              await updateEmployeeRole(email, ['ROLE_USER']);
              Alert.alert('Sukces', 'Rola została zaktualizowana');
              fetchEmployees();
            } catch (error) {
              console.error('Error updating role:', error);
              Alert.alert('Błąd', 'Nie udało się zaktualizować roli');
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
      <View style={styles.addEmployeeContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email pracownika"
          value={newEmployeeEmail}
          onChangeText={setNewEmployeeEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddEmployee}>
          <Text style={styles.addButtonText}>Dodaj</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={employees}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({item}) => (
          <View style={styles.employeeCard}>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeEmail}>{item.email}</Text>
              <Text style={styles.employeeRole}>
                {item.roles?.includes('ROLE_MANAGER') ? 'Manager' : 'Pracownik'}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleUpdateRole(item.email)}>
                <Text style={styles.actionButtonText}>Zmień rolę</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteEmployee(item.email)}>
                <Text style={styles.actionButtonText}>Usuń</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Brak pracowników</Text>
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
  addEmployeeContainer: {
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
  employeeCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  employeeInfo: {
    marginBottom: 10,
  },
  employeeEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  employeeRole: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
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

export default FirmManagementScreen; 