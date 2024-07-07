import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, ScrollView, Pressable, SafeAreaView, RefreshControl } from 'react-native';
import axios from 'axios';
import { Stack, useNavigation, useLocalSearchParams } from 'expo-router';  // Importando os componentes necessários

const Aulas = () => {
  const navigation = useNavigation();

  const { id } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const url = `https://api.estrategiaconcursos.com.br/api/aluno/curso/${id}`;

  // Função para obter o token da API
  const getToken = async () => {
    try {
      const response = await axios.get('https://teal-crostata-aea03c.netlify.app/api/config');
      return response.data.BEARER_TOKEN;
    } catch (error) {
      console.error('Erro ao obter o token:', error);
      throw error;
    }
  };

  // Função para buscar os dados da API
  const fetchData = async () => {
    try {
      const token = await getToken(); // Obtém o token
      const headers = {
        Authorization: `${token}`,
      };

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
        <Stack.Screen options={{
          headerStyle: {
            backgroundColor: '#1B1B1B',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          title: 'AULA'
        }} />
        <Text style={[styles.errorText, styles.whiteText]}>Erro ao carregar os dados do curso.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: '#1B1B1B' }]}>
        <Stack.Screen options={{
          headerStyle: {
            backgroundColor: '#1B1B1B',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          title: 'AULA'
        }} />
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={[styles.whiteText]}>Carregando</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#1E90FF']} />
        }
      >
        <Stack.Screen options={{
          headerStyle: {
            backgroundColor: '#1B1B1B',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          title: data.nome,
        }} />
        <Text style={[styles.title, styles.whiteText]}>{data.nome.toUpperCase()}</Text>
        <Text style={styles.label}>Data de Início: {data.data_inicio}</Text>
        <Text style={styles.label}>Data de Retirada: {data.data_retirada}</Text>
        <Text style={styles.label}>Total de Aulas: {data.total_aulas}</Text>
        <Text style={styles.label}>Total de Aulas Visualizadas: {data.total_aulas_visualizadas}</Text>

        <Text style={[styles.sectionTitle, styles.whiteText]}>AULAS:</Text>

        {data.aulas.map((aula) => (
          <Pressable key={aula.id}
            onPress={() => navigation.navigate('aula', { aula: JSON.stringify(aula), materia: data.nome })}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#333333' : '#1B1B1B',
              marginTop: 5,
              marginBottom: 5,
              marginLeft: 5,
              marginRight: 5
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
  value: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
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
  videoLink: {
    margin: 8,
    padding: 8,
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
  A5B99CText: {
    color: '#A5B99C',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  cursoContainer: {
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
  link: {
    marginTop: 8,
  },
  linkText: {
    color: '#A5B99C',
    textDecorationLine: 'underline',
    textTransform: 'uppercase',
  },
  videoText: {
    marginTop: 20,
    color: '#ffffff',
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#1B1B1B',
    height: 45,
  },
});

export default Aulas;
