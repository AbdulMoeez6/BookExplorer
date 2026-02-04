import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function DetailScreen({ route, navigation }: Props) {
  const { book } = route.params;
  const { title, authors, publishedDate, description, averageRating, ratingsCount, imageLinks } = book.volumeInfo;

  // High res image if available, else thumbnail
  const imageUri = imageLinks?.thumbnail?.replace('http:', 'https:');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.icon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.icon}>🔍</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Book Cover - Centered with Shadow */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={[styles.coverImage, styles.placeholder]} />
          )}
        </View>

        {/* Title Section */}
        <View style={styles.centerMeta}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.author}>{authors?.join(', ')}</Text>
          <Text style={styles.year}>Published in {publishedDate?.substring(0, 4) || 'N/A'}</Text>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Text style={styles.stars}>⭐⭐⭐⭐</Text> 
            <Text style={styles.ratingText}>
              {averageRating || 4.0} ({ratingsCount || 0} reviews)
            </Text>
          </View>
        </View>

        {/* Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the author</Text>
          <Text style={styles.sectionText}>
            {authors?.[0] || 'Unknown'} is a writer known for this work. 
            (Google Books doesn't always provide author bio, this is a safe fallback).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.sectionText} numberOfLines={6}>
            {description || 'No description available for this book.'}
          </Text>
        </View>

        {/* Green Button */}
        <TouchableOpacity style={styles.readButton}>
          <Text style={styles.readButtonText}>✓ Book Read</Text>
        </TouchableOpacity>

      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  icon: {
    fontSize: 24,
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
  },
  placeholder: {
    backgroundColor: '#eee',
  },
  centerMeta: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#111',
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  year: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    color: '#FFD700', // Gold
    marginRight: 5,
  },
  ratingText: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
  readButton: {
    backgroundColor: '#50C878', // Emerald Green matching design
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  readButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});