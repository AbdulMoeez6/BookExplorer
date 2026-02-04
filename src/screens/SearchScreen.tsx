import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import debounce from 'lodash.debounce';

import { Book, RootStackParamList } from '../types';
import { BookService } from '../services/BookService';

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

  const renderItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('Detail', { book: item })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {item.volumeInfo.imageLinks?.smallThumbnail && (
          <Image 
            source={{ uri: item.volumeInfo.imageLinks.smallThumbnail }} 
            style={styles.listThumbnail} 
          />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.volumeInfo.title}</Text>
          <Text style={styles.itemAuthor}>
            by {item.volumeInfo.authors?.join(', ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backArrow}>←</Text> 
        <Text style={styles.headerTitle}>Search Book</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
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
    marginRight: 8,
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    paddingVertical: 12,
  },
  listThumbnail: {
    width: 40, 
    height: 60, 
    marginRight: 10, 
    borderRadius: 4,
    backgroundColor: '#eee'
  },
  itemTitle: {
    fontSize: 16,
    color: '#20B2AA', 
    fontWeight: '500',
    marginBottom: 4,
  },
  itemAuthor: {
    fontSize: 14,
    color: '#888',
  },
});