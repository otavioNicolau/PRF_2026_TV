import { Stack, useNavigation, Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Button, Pressable, Text, StyleSheet, ActivityIndicator, FlatList, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import axios from 'axios';

// URL da API
const url = 'https://api.estrategiaconcursos.com.br/api/aluno/curso';

export default function Index() {

  const navigation = useNavigation();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState(null); // Estado para armazenar o token

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      const initialToken = await getToken();
      setToken(initialToken);

      const courseData = await fetchCourseData(initialToken);
      setData(courseData);
    } catch (error) {
      console.error('Erro ao inicializar os dados:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const refreshedToken = await getToken();
      const courseData = await fetchCourseData(refreshedToken);
      setData(courseData);
    } catch (error) {
      console.error('Erro ao atualizar os dados:', error);
      setError(error);
    } finally {
      setRefreshing(false);
    }
  };

  const getToken = async () => {
    try {
      const response = await axios.get('https://teal-crostata-aea03c.netlify.app/api/config');
      const token = `${response.data.BEARER_TOKEN}`;
      return token;
    } catch (error) {
      console.error('Erro ao obter o token:', error);
      throw error;
    }
  };

  const fetchCourseData = async (token) => {
    try {
      const response = await axios.get(url, { headers: { Authorization: token } });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar os dados do curso:', error);
      throw error;
    }
  };

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1B1B1B',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            title: 'PROJETO RPF',
          }}
        />
        <Text style={styles.errorText}>Erro ao carregar os dados: {error.message}</Text>
        <Button title="Tentar Novamente" onPress={handleRefresh} color="#1E90FF" />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1B1B1B',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            title: 'PROJETO RPF',
          }}
        />
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.whiteText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.containerArea}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#1E90FF']} />
        }
      >
        <Stack.Screen
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1B1B1B',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            title: 'PROJETO RPF',
          }}
        />

        {/* Componente Slide (se necessário) */}
        {/* <Slide /> */}

        {data && data.concursos ? (
          data.concursos.map(concurso => (
            <View key={concurso.id} style={styles.stepContainer}>
              <Text style={styles.subtitle}>{concurso.titulo.toUpperCase()}</Text>
              <FlatList
                horizontal
                data={concurso.cursos}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => navigation.navigate('aulas', { id: item.id })}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? '#333333' : '#1B1B1B',
                      marginTop: 5,
                      marginBottom: 5,
                      marginLeft: 5,
                      marginRight: 5
                    })}
                  >
                    <View style={styles.cursoContainer}>
                      <Text style={styles.cursoNome}>{item.nome.toUpperCase()}</Text>
                      <Text style={styles.cursoInfo}>sDATA DE INÍCIO: {item.data_inicio}</Text>
                      <Text style={styles.cursoInfo}>DATA DE RETIRADA: {item.data_retirada}</Text>
                      <Text style={styles.cursoInfo}>TOTAL DE AULAS: {item.total_aulas}</Text>
                      <Text style={styles.cursoInfo}>TOTAL DE AULAS VISUALIZADAS: {item.total_aulas_visualizadas}</Text>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          ))
        ) : (
          <Text style={styles.errorText}>Não há dados disponíveis.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerArea: {
    flex: 1,
    backgroundColor: '#1B1B1B',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#1B1B1B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  stepContainer: {
    marginBottom: 20,
  },
  cursoContainer: {
    width: 300,
    height: 180,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  whiteText: {
    color: '#ffffff',
  },
  cursoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#ffffff',
  },
  cursoInfo: {
    textAlign: 'center',
    color: '#A5B99C',
    fontWeight: 'bold',
    fontSize: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
    color: '#ffffff',
  },
});
