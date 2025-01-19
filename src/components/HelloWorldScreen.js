import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import {clearToken} from '../services/auth';

const HelloWorldScreen = ({navigation}) => {
  const menuItems = [
    {
      title: 'Spotkania',
      description: 'Zarządzaj spotkaniami',
      screen: 'Meet',
      icon: '📅',
    },
    {
      title: 'Firmy',
      description: 'Zarządzaj firmami',
      screen: 'Firm',
      icon: '🏢',
    },
    {
      title: 'Zadania',
      description: 'Zarządzaj zadaniami',
      screen: 'Task',
      icon: '✓',
    },
  ];

  const handleLogout = () => {
    clearToken();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>KaroRoad</Text>
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Wyloguj się</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    gap: 15,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
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
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HelloWorldScreen;
