import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Alert, ActivityIndicator, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, Stack, Link, useNavigation } from 'expo-router';

const VideoList = ({ videos, aula, assunto, materia }) => {
  const navigation = useNavigation();
  const [focusedVideo, setFocusedVideo] = useState(null); // Estado para gerenciar o foco nos vídeos

  const getVideoUrl = (resolucoes) => {
    if (!resolucoes) {
      return null;
    }
    return resolucoes['720p'] || resolucoes['480p'] || resolucoes['360p'] || null;
  };

  return (
    <View>
      {videos.map((video, index) => (
        <View key={index}>
          <Pressable
            onFocus={() => setFocusedVideo(index)}
            onPress={() =>
              navigation.navigate('video', {
                video: getVideoUrl(video.resolucoes),
                titulo: video.titulo,
                id_video: video.id,
              })
            }
            style={({ focused }) => ({
              backgroundColor: focusedVideo === index ? '#333333' : '#1B1B1B',
              // marginTop: 5,
              // marginBottom: 5,
              // marginLeft: 5,
              // marginRight: 5,
              width: '98%',
              borderWidth: focusedVideo === index ? 2 : 0,
              borderColor: focusedVideo === index ? '#1E90FF' : 'transparent',
              padding:10
            })}
          >
            <View style={styles.videoBox}>
              <Text style={[styles.videoLink, styles.whiteText]}>
                {video.titulo}
              </Text>
            </View>
          </Pressable>
        </View>
      ))}
    </View>
  );
};

export default function Aula() {
  const navigation = useNavigation();
  const { aula, materia } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const aulaJson = JSON.parse(aula);
  const [focusedPdf, setFocusedPdf] = useState(null); // Estado para gerenciar o foco nos PDFs

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulação de carregamento de dados (você pode substituir por sua lógica de carregamento)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={[styles.whiteText]}>Carregando</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* <Stack.Screen options={{
          headerStyle: {
            backgroundColor: '#1B1B1B',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          title: aulaJson.nome,
        }} /> */}
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View key={aulaJson.id} style={styles.aulaContainer}>
          <View style={styles.cursoContainer}>
            <Text style={[styles.materia, styles.whiteText]}>{materia.toUpperCase()}</Text>
            <Text style={[styles.aula, styles.whiteText]}>{aulaJson.nome.toUpperCase()}</Text>

            <Text style={styles.whiteText}>{aulaJson.conteudo}</Text>

            {/* <Text style={[styles.videoTitle, styles.whiteText]}>ARQUIVOS:</Text>
            {!aulaJson.pdf && !aulaJson.pdf_grifado && !aulaJson.pdf_simplificado ? (
              <Text style={styles.whiteText}>NENHUM PDF DISPONÍVEL</Text>
            ) : (
              <>
                {aulaJson.pdf && (
                  <Pressable
                    onFocus={() => setFocusedPdf('pdf')}
                    onPress={() => Linking.openURL(aulaJson.pdf)}
                    style={({ focused }) => ({
                      backgroundColor: focusedPdf === 'pdf' ? '#333333' : '#1B1B1B',
                      marginBottom: 10,
                      borderWidth: focusedPdf === 'pdf' ? 2 : 0,
                      borderColor: focusedPdf === 'pdf' ? '#1E90FF' : 'transparent',
                    })}
                  >
                    <Text style={[styles.linkText, styles.A5B99CText]}>PDF NORMAL</Text>
                  </Pressable>
                )}
                {aulaJson.pdf_grifado && (
                  <Pressable
                    onFocus={() => setFocusedPdf('pdf_grifado')}
                    onPress={() => Linking.openURL(aulaJson.pdf_grifado)}
                    style={({ focused }) => ({
                      backgroundColor: focusedPdf === 'pdf_grifado' ? '#333333' : '#1B1B1B',
                      marginBottom: 10,
                      borderWidth: focusedPdf === 'pdf_grifado' ? 2 : 0,
                      borderColor: focusedPdf === 'pdf_grifado' ? '#1E90FF' : 'transparent',
                    })}
                  >
                    <Text style={[styles.linkText, styles.A5B99CText]}>PDF GRIFADO</Text>
                  </Pressable>
                )}
                {aulaJson.pdf_simplificado && (
                  <Pressable
                    onFocus={() => setFocusedPdf('pdf_simplificado')}
                    onPress={() => Linking.openURL(aulaJson.pdf_simplificado)}
                    style={({ focused }) => ({
                      backgroundColor: focusedPdf === 'pdf_simplificado' ? '#333333' : '#1B1B1B',
                      marginBottom: 10,
                      borderWidth: focusedPdf === 'pdf_simplificado' ? 2 : 0,
                      borderColor: focusedPdf === 'pdf_simplificado' ? '#1E90FF' : 'transparent',
                    })}
                  >
                    <Text style={[styles.A5B99CText]}>PDF SIMPLIFICADO</Text>
                  </Pressable>
                )}
              </>
            )} */}
            <Text style={[styles.videoTitle, styles.whiteText]}>VIDEOS:</Text>
            <VideoList materia={materia} aula={aulaJson.nome} assunto={aulaJson.conteudo} videos={aulaJson.videos} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1B1B1B',
  },
  videoLink: {
    flex: 1,
    padding: 10,
  },
  container: {
    backgroundColor: '#1B1B1B',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  whiteText: {
    color: '#ffffff',
  },
  A5B99CText: {
    color: '#fff',
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#ffffff',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  materia: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    width: '99%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  aula: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 1,
    marginBottom: 5,
  },
  cursoContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'col',
    justifyContent: 'flex-start',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#A5B99C',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  actionButtonRed: {
    backgroundColor: 'rgb(255, 0, 0)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  watchedButton: {
    backgroundColor: '#4CAF50',
  },
  progressText: {
    color: '#fff',
    marginLeft: 10,
  },
  videoBox: {
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B1B1B',
  },
});
