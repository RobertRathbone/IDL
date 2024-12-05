import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';

const CaptureAndSave = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [recognizedText, setRecognizedText] = useState(null);
  const cameraRef = useRef(null);
  const device = useCameraDevice('back')

  // Effect to monitor devices and permissions
  useEffect(() => {
    (async () => {
      const permission = await Camera.getCameraPermissionStatus();
      console.log("Initial permission status:", permission);

      if (permission === 'authorized') {
        setPermissionGranted(true);
      }
    })();
  }, [device]);


  const handleGrantPermission = async () => {
    try {
      const status = await Camera.requestCameraPermission();
      console.log("Permission status after request:", status);

      if (status === 'granted') {
        setPermissionGranted(true);
      } else {
        Alert.alert(
          'Permission Denied',
          'Camera access is required to take pictures.'
        );
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      Alert.alert('Error', 'Failed to request camera permission.');
    }
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not ready.');
      return;
    }

    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'balanced',
      });
      console.log('Captured photo path:', photo.path);
      setImageUri(photo.path);
      await processImageForOCR(photo.path)
      Alert.alert('Picture Taken', 'Picture has been captured!');
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert('Error', 'Failed to take a picture: ' + error.message);
    }
  };

  const processImageForOCR = async (path) => {

    const formattedPath = path.startsWith('file://') ? path : `file://${path}`;
    try {
      const result = await TextRecognition.recognize(formattedPath);
      setRecognizedText(result.text || 'No text recognized.');
      console.log(result.text)
    } catch (error) {
      console.error('Error performing OCR:', error);
      Alert.alert('Error', 'Failed to process image for OCR: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      {permissionGranted ? (
        <>
          {imageUri ? (
            <>
              <Image source={{ uri: `file://${imageUri}` }} style={styles.preview} />
              <TouchableOpacity style={styles.button} onPress={() => setImageUri(null)}>
                <Text style={styles.buttonText}>Take Another Picture</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Camera
                style={styles.camera}
                device={device}
                isActive={true}
                photo={true}
                ref={cameraRef}
              />
              <TouchableOpacity style={styles.button} onPress={handleTakePicture}>
                <Text style={styles.buttonText}>Take Picture</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleGrantPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '70%',
  },
  preview: {
    width: '100%',
    height: '70%',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CaptureAndSave;
