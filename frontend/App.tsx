import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Digital Twin</Text>
      <Text style={styles.subtitle}>Track your health with AI.</Text>
      <Button title="Get Started" onPress={() => {}} />
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
});
