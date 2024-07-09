import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Pressable, SafeAreaView, RefreshControl } from 'react-native';
import axios from 'axios';
import { Stack, useNavigation, useLocalSearchParams } from 'expo-router';

const Aulas = () => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [focusedAula, setFocusedAula] = useState(null); // Estado para gerenciar o foco

  const url = `https://api.estrategiaconcursos.com.br/api/aluno/curso/${id}`;

  const getToken = async () => {
    try {
      const response = await axios.get('https://teal-crostata-aea03c.netlify.app/api/config');
      return response.data.BEARER_TOKEN;
    } catch (error) {
      console.error('Erro ao obter o token:', error);
      throw error;
    }
  };

  const fetchData = async () => {
    try {
      const token = await getToken();
      const headers = { Authorization: `${token}` };
      const response = await axios.get(url, { headers });
      setData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar os dados:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: '#1B1B1B' }]}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <Text style={[styles.errorText, styles.whiteText]}>Erro ao carregar os dados do curso.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: '#1B1B1B' }]}>
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
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#1E90FF']} />}
      >
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        {/* <Stack.Screen options={{
          headerStyle: { backgroundColor: '#1B1B1B' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          title: data.nome,
        }} /> */}
        <Text style={[styles.title, styles.whiteText]}>{data.nome.toUpperCase()}</Text>
        <Text style={styles.label}>Data de Início: {data.data_inicio}</Text>
        <Text style={styles.label}>Data de Retirada: {data.data_retirada}</Text>
        <Text style={styles.label}>Total de Aulas: {data.total_aulas}</Text>
        <Text style={styles.label}>Total de Aulas Visualizadas: {data.total_aulas_visualizadas}</Text>

        <Text style={[styles.sectionTitle, styles.whiteText]}>AULAS:</Text>

        {data.aulas.map((aula) => (
          <Pressable
            key={aula.id}
            onFocus={() => setFocusedAula(aula.id)}
            onPress={() => navigation.navigate('aula', { aula: JSON.stringify(aula), materia: data.nome })}
            style={({ focused }) => ({
              backgroundColor: focusedAula === aula.id ? '#333333' : '#1B1B1B',
              // marginTop: 5,
              // marginBottom: 5,
              // marginLeft: 5,
              // marginRight: 5,
              borderWidth: focusedAula === aula.id ? 2 : 0,
              borderColor: focusedAula === aula.id ? '#1E90FF' : 'transparent',
              padding: 10,
            })}
          >
            <View style={styles.aulaContainer}>
              <View style={styles.cursoContainer}>
                <Text style={[styles.cursoNome, styles.label]}>{aula.nome.toUpperCase()}</Text>
                <Text style={styles.whiteText}>{aula.conteudo}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  label: {
    color: '#A5B99C',
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#1B1B1B',
  },
  scrollView: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  container: {
    backgroundColor: '#1B1B1B',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  whiteText: {
    color: '#ffffff',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    marginTop:10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  aulaContainer: {
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  cursoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',
  },
});

export default Aulas;
