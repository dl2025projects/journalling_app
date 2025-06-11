import React, { useRef } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing,
  View
} from 'react-native';

const AnimatedButton = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  color = '#4a6ea9',
  danger = false,
  disabled = false,
  icon = null,
  small = false
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 150,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          small && styles.smallButton,
          { backgroundColor: danger ? '#e74c3c' : color },
          disabled && styles.disabledButton,
          style,
        ]}
        disabled={disabled}
      >
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[
            styles.text, 
            small && styles.smallText,
            textStyle, 
            disabled && styles.disabledText
          ]}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 5,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 13,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledText: {
    color: '#999999',
  },
});

export default AnimatedButton; 