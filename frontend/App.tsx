import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";

export default function App() {
  const [response, setResponse] = useState<string>("");

  const sendTestData = async () => {
    const data = { message: "Hello from frontend" };
    try {
      const response = await fetch("http://10.0.2.2:5000/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Error sending data:", error);
      setResponse("Error connecting to server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Digital Twin</Text>
      <Text style={styles.subtitle}>Track your health with AI.</Text>
      <Button title="Get Started" onPress={() => {}} />
      <Button title="Test Backend" onPress={sendTestData} />
      {response && <Text style={styles.response}>{response}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  response: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
});
