import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StreakCounter = ({ streak }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.number}>{streak}</Text>
      <Text style={styles.text}>day streak</Text>
      <View style={styles.fireContainer}>
        <Text style={styles.fire}>🔥</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff33',
    borderRadius: 20,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    position: 'relative',
  },
  number: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  text: {
    color: 'white',
    fontSize: 12,
  },
  fireContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  fire: {
    fontSize: 20,
  },
});

export default StreakCounter; 