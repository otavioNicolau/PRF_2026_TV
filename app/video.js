import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, TouchableWithoutFeedback, Pressable } from 'react-native';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useTVEventHandler } from 'react-native';

const VIDEO_DATA_FILE = `${FileSystem.documentDirectory}videoData.json`;

const readVideoData = async () => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(VIDEO_DATA_FILE);
    if (!fileInfo.exists) {
      return {};
    }
    const content = await FileSystem.readAsStringAsync(VIDEO_DATA_FILE);
    return JSON.parse(content);
  } catch (e) {
    console.error("Error reading video data file", e);
    return {};
  }
};

const saveVideoData = async (data) => {
  try {
    await FileSystem.writeAsStringAsync(VIDEO_DATA_FILE, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving video data file", e);
  }
};

export default function Video1() {
  const { video, titulo, id_video } = useLocalSearchParams();
  const videoRef = useRef(null);
  const [videoSpeed, setVideoSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoPosition, setVideoPosition] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };

    lockOrientation();
  }, []);

  useEffect(() => {
    const loadVideoPosition = async () => {
      try {
        const data = await readVideoData();
        if (data[id_video]) {
          const position = data[id_video].position;
          setVideoPosition(position);
          if (videoRef.current) {
            await videoRef.current.setPositionAsync(position);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadVideoPosition();
  }, [id_video]);

  useEffect(() => {
    const saveVideoPosition = async () => {
      try {
        const data = await readVideoData();
        data[id_video] = { titulo, position: videoPosition };
        await saveVideoData(data);
      } catch (e) {
        console.error(e);
      }
    };

    saveVideoPosition();
  }, [id_video, titulo, videoPosition]);

  const increaseSpeed = useCallback(() => {
    setVideoSpeed(prevSpeed => Math.min(prevSpeed + 0.25, 2.0));
  }, []);

  const decreaseSpeed = useCallback(() => {
    setVideoSpeed(prevSpeed => Math.max(prevSpeed - 0.25, 0.5));
  }, []);

  const handleFullscreenUpdate = async ({ fullscreenUpdate }) => {
    if (fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_DID_PRESENT) {
      setIsFullscreen(true);
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else if (fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS) {
      setIsFullscreen(false);
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pauseAsync();
    } else {
      videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
    setControlsVisible(true); // Mostra os controles ao clicar no vídeo
    startControlsTimer(); // Reinicia o temporizador ao clicar no vídeo
  };

  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setVideoPosition(status.positionMillis);
      setVideoDuration(status.durationMillis || 0);
    }
  };

  const handleSliderValueChange = async (value) => {
    if (videoDuration > 0) {
      const newPosition = value * videoDuration;
      setVideoPosition(newPosition);
      if (videoRef.current) {
        await videoRef.current.setPositionAsync(newPosition);
      }
    }
  };

  const startControlsTimer = () => {
    setControlsVisible(true); // Mostra os controles ao iniciar o temporizador
    clearTimeout(timerId); // Limpa o temporizador existente
    const timerId = setTimeout(() => {
      setControlsVisible(false); // Oculta os controles após 3 segundos de inatividade
    }, 3000);
  };

  const handleTouchScreen = () => {
    setControlsVisible(true); // Mostra os controles ao tocar na tela
    startControlsTimer(); // Reinicia o temporizador ao tocar na tela
  };

  const formatTime = (timeInMillis) => {
    if (!timeInMillis) return '00:00';
    const totalSeconds = timeInMillis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
  };

  // Handle TV remote events
  const handleTVEvent = (evt) => {
    switch (evt.eventType) {
      case 'playPause':
        togglePlayPause();
        break;
      case 'left':
        videoRef.current.setPositionAsync(videoPosition - 10000); // Rewind 10 seconds
        break;
      case 'right':
        videoRef.current.setPositionAsync(videoPosition + 10000); // Fast forward 10 seconds
        break;
      case 'up':
        increaseSpeed(); // Increase speed
        break;
      case 'down':
        decreaseSpeed(); // Decrease speed
        break;
      case 'select':
        setControlsVisible(!controlsVisible);
        break;
      default:
        break;
    }
  };

  useTVEventHandler(handleTVEvent);

  return (
    <SafeAreaView style={styles.containerArea}>
      <Stack.Screen
        options={{
          headerShown: false,
          title: titulo,
        }}
      />
      <TouchableWithoutFeedback onPress={handleTouchScreen}>
        <View style={[styles.videoContainer, isFullscreen && styles.fullscreenVideoContainer]}>
          <Video
            ref={videoRef}
            source={{ uri: video }}
            style={styles.video}
            resizeMode="contain"
            rate={videoSpeed}
            onFullscreenUpdate={handleFullscreenUpdate}
            shouldPlay
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            useNativeControls={isFullscreen}
          />
          {!isFullscreen && controlsVisible && (
            <View style={styles.controlsContainer}>
              <Pressable onPress={togglePlayPause} style={styles.controlButton}>
                {({ pressed }) => (
                  <MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={32} color={pressed ? '#1E90FF' : 'white'} />
                )}
              </Pressable>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={videoDuration > 0 ? videoPosition / videoDuration : 0}
                onValueChange={handleSliderValueChange}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
                thumbTintColor="#FFFFFF"
              />
              <Text style={styles.timeDisplay}>
                {formatTime(videoPosition)} / {formatTime(videoDuration)}
              </Text>
              <Pressable onPress={decreaseSpeed} style={styles.controlButton}>
                {({ pressed }) => (
                  <MaterialIcons name="remove" size={24} color={pressed ? '#1E90FF' : 'white'} />
                )}
              </Pressable>
              <Text style={styles.controlText}>{videoSpeed.toFixed(2)}x</Text>
              <Pressable onPress={increaseSpeed} style={styles.controlButton}>
                {({ pressed }) => (
                  <MaterialIcons name="add" size={24} color={pressed ? '#1E90FF' : 'white'} />
                )}
              </Pressable>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerArea: {
    flex: 1,
    backgroundColor: '#1B1B1B',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#1B1B1B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideoContainer: {
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    padding: 10,
  },
  controlText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10,
  },
  timeDisplay: {
    color: '#FFF',
    fontSize: 16,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
});
