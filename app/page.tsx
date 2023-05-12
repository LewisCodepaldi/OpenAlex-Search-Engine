"use client"

import axios from 'axios';
import { useState } from 'react';
import { Input, Button, Paper, Divider } from '@mantine/core';
import React from 'react';

interface Author {
  display_name: string;
}

interface SearchResult {
  id: string;
  title: string;
  abstract: string;
  publication_date: number;
  doi: string;
  display_name: string;
  authorships: {
    author: Author;
  }[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');

  const handleSearch = async () => {
    try {
      console.log('Search query:', searchQuery);
      console.log('Selected authors:', selectedAuthors);
      console.log('Selected start date:', selectedStartDate);
      console.log('Selected end date:', selectedEndDate);

      let apiUrl = `https://api.openalex.org/works?filter=display_name.search:${encodeURIComponent(
        searchQuery
      )}`;


      if (selectedAuthors.length > 0) {
        const authorQuery = selectedAuthors
          .map((author) => `author:${encodeURIComponent(author)}`)
          .join(' OR ');
        apiUrl += `,authorships.author.id:${encodeURIComponent(authorQuery)}`;
      }
      if (selectedStartDate) {
        apiUrl += `,from_publication_date:${encodeURIComponent(selectedStartDate)}`;
      }
      if (selectedEndDate) {
        apiUrl += `,to_publication_date:${encodeURIComponent(selectedEndDate)}`;
      }

      const response = await axios.get(apiUrl);
      console.log('API response:', response.data);
      const searchResults = response.data.results;
      console.log('Search results:', searchResults);
      setSearchResults(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: '#6495ED' }}>
      <div>
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          placeholder="Enter search query"
          style={{ marginBottom: '1rem' }}
        />
        <Button onClick={handleSearch} color="blue">
        Σ Search
        </Button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <label htmlFor="authors">Authorship:</label>
        <Input
          id="authors"
          value={selectedAuthors.join(', ')}
          onChange={(event) =>
            setSelectedAuthors(event.currentTarget.value.split(',').map((author) => author.trim()))
          }
          placeholder="Enter author ID"
          style={{ marginBottom: '1rem' }}
        />

        <label htmlFor="startDate">Start Date:</label>
        <Input
          id="startDate"
          type="date"
          value={selectedStartDate}
          onChange={(event) => setSelectedStartDate(event.currentTarget.value)}
          style={{ marginBottom: '1rem' }}
        />

        <label htmlFor="endDate">End Date:</label>
        <Input
          id="endDate"
          type="date"
          value={selectedEndDate}
          onChange={(event) => setSelectedEndDate(event.currentTarget.value)}
          style={{ marginBottom: '1rem' }}
        />
      </div>

      {searchResults.map((result) => (
        <Paper key={result.id} shadow="xs" style={{ marginTop: '1rem', padding: '1rem' }}>
          <h3>
            <a href={result.doi} target="_blank" rel="noopener noreferrer" style={{ color: '#4169E1' }}>
              {result.title}
            </a>
          </h3>
          <Divider style={{ margin: '0.5rem 0' }} />
          <p>
            {result.authorships.map((authorship) => (
              <span key={authorship.author.display_name}>{authorship.author.display_name}, </span>
            ))}
          </p>
          <p>{result.abstract}</p>
          <p>{result.publication_date}</p>
          <Divider style={{ margin: '0.5rem 0' }} />
        </Paper>
      ))}
    </div>
  );
}
