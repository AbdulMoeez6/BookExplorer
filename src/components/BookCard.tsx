import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onPress: () => void;
}

export const BookCard = ({ book, onPress }: BookCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} testID="book-card">
      <View style={styles.row}>
        {book.volumeInfo.imageLinks?.smallThumbnail && (
          <Image
            source={{ uri: book.volumeInfo.imageLinks.smallThumbnail }}
            style={styles.thumbnail}
            testID="book-thumbnail"
          />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {book.volumeInfo.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            by {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 40,
    height: 60,
    marginRight: 10,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#20B2AA', // Teal
    fontWeight: '500',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#888',
  },
});