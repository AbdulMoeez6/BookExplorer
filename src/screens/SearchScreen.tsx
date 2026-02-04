import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import debounce from 'lodash.debounce';
import { Feather } from '@expo/vector-icons';

import { Book, RootStackParamList } from '../types';
import { BookService } from '../services/BookService';
import { BookCard } from '../components/BookCard'; // Import the new component

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const THEME_TEAL = '#20B2AA'; 

  const searchBooks = async (text: string) => {
    if (!text) {
      setBooks([]);
      return;
    }
    try {
      setLoading(true);
      const results = await BookService.searchBooks(text);
      setBooks(results);
    } catch (error) {
      console.log('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchBooks, 500), []);

  const handleTextChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  // CLEANER RENDER FUNCTION
  const renderItem = ({ item }: { item: Book }) => (
    <BookCard 
      book={item} 
      onPress={() => navigation.navigate('Detail', { book: item })} 
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backArrow}>←</Text> 
        <Text style={styles.headerTitle}>Search Book</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Book title or author"
          placeholderTextColor="#999"
          value={query}
          onChangeText={handleTextChange}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={THEME_TEAL} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', 
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 16,
  },
});