import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

// We'll use the screen width to size the progress bars nicely
const SCREEN_WIDTH = Dimensions.get('screen').width;

// Types (optional if you're using TypeScript)
interface UserFactor {
  label: string;       // e.g., "Smoking", "Alcohol", etc.
  percentile: number;  // e.g., 0.01 for 1st percentile, 0.5 for 50th, etc.
}

interface HealthDashboardProps {
  biologicalAge: number;     // e.g., 35
  healthScore: number;       // range: 0 to 1 (0 = poor health, 1 = excellent)
  factors: UserFactor[];     // array of user factors
  onSeeMyFuture: () => void; // callback for button press
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({
  biologicalAge,
  healthScore,
  factors,
  onSeeMyFuture,
}) => {
  
  // Convert a 0→1 healthScore to a color from red→green
  const getHealthColor = (score: number) => {
    // Red goes from 255→0, Green goes from 0→255
    const red = Math.round(255 * (1 - score));
    const green = Math.round(255 * score);
    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <View style={styles.container}>
      {/* Title and Biological Age */}
      <Text style={styles.title}>Biological Age</Text>
      <Text style={styles.ageValue}>{biologicalAge}</Text>

      {/* Avatar with a dynamic background color */}
      <View style={[styles.avatarContainer, { backgroundColor: getHealthColor(healthScore) }]}>
        <Text style={styles.avatarText}>Avatar</Text>
        {/* 
          In a real app, you might replace this Text with:
          <Image source={require('./path/to/avatar-silhouette.png')} style={styles.avatarImage} />
          and tint it or overlay color. 
        */}
      </View>

      {/* Progress bars for each factor */}
      {factors.map((factor, index) => {
        return (
          <View style={styles.factorRow} key={index}>
            <Text style={styles.factorLabel}>{factor.label}</Text>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: factor.percentile * (SCREEN_WIDTH * 0.6) },
                ]}
              />
            </View>
            <Text style={styles.percentileText}>
              {Math.round(factor.percentile * 100)}th percentile
            </Text>
          </View>
        );
      })}

      {/* "See My Future" Button */}
      <TouchableOpacity style={styles.button} onPress={onSeeMyFuture}>
        <Text style={styles.buttonText}>See My Future</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HealthDashboard;

// ------------------------- STYLES -------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  ageValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
  },
  factorRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  factorLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#444',
  },
  progressBarBackground: {
    width: SCREEN_WIDTH * 0.6, // 60% of screen width
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#4287f5',
  },
  percentileText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#0f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});