import axios from 'axios';
import { Book } from '../types';

// Helper to clean text
const cleanText = (text: string | { value: string } | undefined) => {
  if (!text) return null;
  const str = typeof text === 'string' ? text : text.value;
  return str.replace(/\r\n/g, '\n').replace(/--/g, '—');
};

export const BookService = {
  /**
   * Searches for books using Open Library and maps them to our Book interface.
   */
  searchBooks: async (query: string): Promise<Book[]> => {
    if (!query) return [];
    
    try {
      const response = await axios.get(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=10`
      );

      return response.data.docs.map((item: any) => ({
        id: item.key, 
        volumeInfo: {
          title: item.title,
          authors: item.author_name || ['Unknown Author'],
          publishedDate: item.first_publish_year?.toString() || 'N/A',
          description: item.first_sentence?.[0] || 'No description available.',
          averageRating: item.ratings_average ? parseFloat(item.ratings_average.toFixed(1)) : 0,
          ratingsCount: item.ratings_sortable || 0,
          imageLinks: item.cover_i ? {
            thumbnail: `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`,
            smallThumbnail: `https://covers.openlibrary.org/b/id/${item.cover_i}-S.jpg`
          } : undefined
        }
      }));
    } catch (error) {
      console.error('BookService search error:', error);
      throw error;
    }
  },

  /**
   * Fetches full details: Description, Author Bio (w/ Wiki fallback), and Ratings.
   */
  getBookDetails: async (bookId: string, authorName?: string) => {
    const result = {
      description: 'No overview available.',
      authorBio: 'Author information not listed.',
      rating: { average: 0, count: 0 }
    };

    try {
      // 1. Get Work Details (Description)
      const workRes = await axios.get(`https://openlibrary.org${bookId}.json`);
      const workData = workRes.data;
      const desc = cleanText(workData.description);
      if (desc) result.description = desc;

      // 2. Get Author Bio
      let bioFound = false;
      
      // Step A: Try Open Library
      if (workData.authors && workData.authors.length > 0) {
        try {
          const authorKey = workData.authors[0].author.key;
          const authorRes = await axios.get(`https://openlibrary.org${authorKey}.json`);
          const olBio = cleanText(authorRes.data.bio);
          if (olBio) {
            result.authorBio = olBio;
            bioFound = true;
          }
        } catch (e) { /* Ignore OL failure */ }
      }

      // Step B: Try Wikipedia fallback (NOW WITH HEADERS)
      if (!bioFound && authorName) {
        try {
          // Wikipedia requires a User-Agent or it blocks the request
          const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(authorName)}`;
          const wikiRes = await axios.get(wikiUrl, {
            headers: { 'User-Agent': 'BookExplorerApp/1.0 (student_project)' }
          });
          
          if (wikiRes.data.extract) {
            result.authorBio = wikiRes.data.extract;
            bioFound = true;
          }
        } catch (e) { 
          // console.log("Wiki failed", e); 
        }
      }

      // Step C: FINAL FALLBACK (Professional Polish)
      // If James Clear has no Wiki page, we show a clean message instead of "Not Listed"
      if (!bioFound && authorName) {
         result.authorBio = `${authorName} is the author of this book. Detailed biographical information is currently unavailable from public sources.`;
      }

      // 3. Get Ratings
      try {
        const ratingsUrl = `https://openlibrary.org${bookId}/ratings.json`;
        const ratingsRes = await axios.get(ratingsUrl);
        const counts = ratingsRes.data.counts || {};
        const totalCount = Object.values(counts).reduce((a: any, b: any) => a + b, 0) as number;
        
        if (totalCount > 0) {
           let weightedSum = 0;
           Object.keys(counts).forEach(key => {
             weightedSum += (counts[key] || 0) * parseInt(key);
           });
           result.rating = {
             average: parseFloat((weightedSum / totalCount).toFixed(1)),
             count: totalCount
           };
        } else if (ratingsRes.data.summary) {
           result.rating = {
             average: ratingsRes.data.summary.average || 0,
             count: ratingsRes.data.summary.count || 0
           };
        }
      } catch (e) { /* Ignore ratings failure */ }

    } catch (error) {
      console.error('BookService details error:', error);
    }
    
    return result;
  }
};