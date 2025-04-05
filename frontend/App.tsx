import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';

const App: React.FC = () => {
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [name, setName] = useState('');

  const sendDataToBackend = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          age: age,
          height: height,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Data sent successfully!');
      } else {
        Alert.alert('Error', 'Failed to send data.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while sending data.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        keyboardType="default"
      />

      <Text style={styles.label}>Age:</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        placeholder="Enter your age"
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Height (cm):</Text>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={setHeight}
        placeholder="Enter your height"
        keyboardType="number-pad"
      />

      <Button title="Send Data" onPress={sendDataToBackend} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
});

export default App;