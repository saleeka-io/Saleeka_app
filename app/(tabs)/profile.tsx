import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';

const Profile = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth().signOut();
      router.replace('/Home'); // Redirect to login after logout
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleMenuItemPress = (route: string) => {
    if (route === 'score') {
      router.push('/score');
    } else if (route == 'coming-soon'){
      router.push('/ComingSoon');
    }
    else{
      router.push('/ContactUs');
    }
  };

  const handleHistoryPress = (route: string) => {
    if(route === 'history-screen'){
      router.push('/HistoryScreen')
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      
      <View style={styles.profileSection}>
        <Image
          source={require('assets/images/profile.png')}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => handleHistoryPress('history-screen')}>
          <Ionicons name="calendar-outline" size={24} color="#3A6A64" />
          <Text style={styles.menuItemText}>Scan History</Text>
          <Ionicons name="chevron-forward" size={24} color="#3A6A64" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('coming-soon')}>
          <Ionicons name="warning-outline" size={24} color="#3A6A64" />
          <Text style={styles.menuItemText}>Allergies</Text>
          <Ionicons name="chevron-forward" size={24} color="#3A6A64" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('coming-soon')}>
          <Ionicons name="cube-outline" size={24} color="#3A6A64" />
          <Text style={styles.menuItemText}>Products Sent</Text>
          <Ionicons name="chevron-forward" size={24} color="#3A6A64" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('score')}>
          <Ionicons name="flag-outline" size={24} color="#3A6A64" />
          <Text style={styles.menuItemText}>Learn About Our Flags</Text>
          <Ionicons name="chevron-forward" size={24} color="#3A6A64"/>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('coming-soon')}>
          <Ionicons name="language-outline" size={24} color="#3A6A64" />
          <Text style={styles.menuItemText}>Language</Text>
          <Ionicons name="chevron-forward" size={24} color="#3A6A64" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('ContactUs')}>
          <Ionicons name="mail-outline" size={24} color="#3A6A64" />
          <Text style={styles.menuItemText}>Contact Us</Text>
          <Ionicons name="chevron-forward" size={24} color="#3A6A64" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1ede1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A6A64',
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: '#3A6A64',
    paddingBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#f1ede1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#3A6A64',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;
