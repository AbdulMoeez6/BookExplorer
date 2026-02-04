import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

// Helper to clean up Open Library text
const cleanText = (text: string | { value: string } | undefined) => {
  if (!text) return null;
  const str = typeof text === 'string' ? text : text.value;
  // Remove messy markdown or newlines if any
  return str.replace(/\r\n/g, '\n').replace(/--/g, '—');
};

export default function DetailScreen({ route, navigation }: Props) {
  const { book } = route.params;
  const initialInfo = book.volumeInfo;

  const [description, setDescription] = useState<string>('Loading overview...');
  const [authorBio, setAuthorBio] = useState<string>('Loading author details...');
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const imageUri = initialInfo.imageLinks?.thumbnail?.replace('http:', 'https:');

  useEffect(() => {
    const fetchRichData = async () => {
      try {
        setLoading(true);

        // --- 1. GET WORK DETAILS (Description) ---
        const workUrl = `https://openlibrary.org${book.id}.json`;
        const workRes = await axios.get(workUrl);
        const workData = workRes.data;

        const desc = cleanText(workData.description) || 'No overview available for this book.';
        setDescription(desc);

        // --- 2. GET AUTHOR BIO (With Wikipedia Fallback) ---
        let bioFound = false;
        
        // Step A: Try Open Library
        if (workData.authors && workData.authors.length > 0) {
          try {
            const authorKey = workData.authors[0].author.key;
            const authorUrl = `https://openlibrary.org${authorKey}.json`;
            const authorRes = await axios.get(authorUrl);
            const olBio = cleanText(authorRes.data.bio);

            if (olBio) {
              setAuthorBio(olBio);
              bioFound = true;
            }
          } catch (e) {
            console.log("Open Library Author Fetch failed, trying Wikipedia...");
          }
        }

        // Step B: Wikipedia Fallback (If Open Library failed or was empty)
        if (!bioFound) {
          const authorName = initialInfo.authors?.[0];
          if (authorName) {
            try {
              // Wikipedia Summary API is free and doesn't need a key
              const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(authorName)}`;
              const wikiRes = await axios.get(wikiUrl);
              
              if (wikiRes.data.extract) {
                setAuthorBio(wikiRes.data.extract);
                bioFound = true;
              }
            } catch (e) {
              console.log("Wikipedia Fetch failed");
            }
          }
        }

        // Step C: Final Fallback
        if (!bioFound) {
           setAuthorBio(`James Clear is a writer known for this work. (Biography data currently unavailable).`);
        }

        // --- 3. GET RATINGS ---
        try {
            const ratingsUrl = `https://openlibrary.org${book.id}/ratings.json`;
            const ratingsRes = await axios.get(ratingsUrl);
            const counts = ratingsRes.data.counts || {};
            const totalCount = (counts['1'] || 0) + (counts['2'] || 0) + (counts['3'] || 0) + (counts['4'] || 0) + (counts['5'] || 0);
            
            let weightedSum = 0;
            if (totalCount > 0) {
                weightedSum += (counts['1'] || 0) * 1;
                weightedSum += (counts['2'] || 0) * 2;
                weightedSum += (counts['3'] || 0) * 3;
                weightedSum += (counts['4'] || 0) * 4;
                weightedSum += (counts['5'] || 0) * 5;
                const avg = (weightedSum / totalCount).toFixed(1);
                setRating({ average: parseFloat(avg), count: totalCount });
            } else {
                setRating({ average: ratingsRes.data.summary?.average || 0, count: ratingsRes.data.summary?.count || 0 });
            }
        } catch (e) {
            console.log("Ratings fetch failed");
        }

      } catch (error) {
        console.error("Error fetching rich details:", error);
        setDescription("Could not load full details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRichData();
  }, [book.id]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Book Detail</Text>
        <TouchableOpacity style={styles.iconButton}>
           <Text style={styles.iconText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Book Cover */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={[styles.coverImage, styles.placeholder]} />
          )}
        </View>

        {/* Title Section */}
        <View style={styles.centerMeta}>
          <Text style={styles.title}>{initialInfo.title}</Text>
          <Text style={styles.author}>{initialInfo.authors?.join(', ')}</Text>
          <Text style={styles.year}>Published in {initialInfo.publishedDate}</Text>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
             <View style={{ flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Text key={star} style={{ color: star <= Math.round(rating.average) ? '#FFD700' : '#ddd', fontSize: 16 }}>
                        ★
                    </Text>
                ))}
             </View>
            <Text style={styles.ratingText}>
              {' '}{rating.average || 'N/A'} ({rating.count} reviews)
            </Text>
          </View>
        </View>

        {loading ? (
            <View style={{ marginTop: 20 }}>
                <ActivityIndicator size="large" color="#20B2AA" />
                <Text style={{ textAlign: 'center', marginTop: 10, color: '#888' }}>Loading author & book details...</Text>
            </View>
        ) : (
            <>
                <View style={styles.section}>
                <Text style={styles.sectionTitle}>About the author</Text>
                <Text style={styles.sectionText}>
                    {authorBio}
                </Text>
                </View>

                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <Text style={styles.sectionText}>
                    {description}
                </Text>
                </View>
            </>
        )}

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
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center'
  },
  iconButton: {
    padding: 8,
  },
  iconText: {
    fontSize: 24,
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
  },
  placeholder: {
    backgroundColor: '#E0E0E0',
  },
  centerMeta: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#111',
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  year: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginLeft: 6
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
  },
  readButton: {
    backgroundColor: '#50C878',
    marginHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#50C878",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  readButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});