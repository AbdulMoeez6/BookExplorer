import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BookCard } from '../BookCard';
import { Book } from '../../types';

// Mock Data
const mockBook: Book = {
  id: '123',
  volumeInfo: {
    title: 'Atomic Habits',
    authors: ['James Clear'],
    publishedDate: '2018',
    description: 'Test description',
    averageRating: 5,
    ratingsCount: 100,
    imageLinks: {
      thumbnail: 'https://example.com/img.jpg',
      smallThumbnail: 'https://example.com/img_small.jpg',
    },
  },
};

describe('BookCard', () => {
  it('renders book title and author correctly', () => {
    const onPressMock = jest.fn();
    
    const { getByText } = render(
      <BookCard book={mockBook} onPress={onPressMock} />
    );

    // Assert: Check if title and author exist on screen
    expect(getByText('Atomic Habits')).toBeTruthy();
    expect(getByText('by James Clear')).toBeTruthy();
  });

  it('calls onPress when clicked', () => {
    const onPressMock = jest.fn();
    
    const { getByTestId } = render(
      <BookCard book={mockBook} onPress={onPressMock} />
    );

    // Act: Simulate a user tap
    fireEvent.press(getByTestId('book-card'));

    // Assert: Check if the function was called
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});