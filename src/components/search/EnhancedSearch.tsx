import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  X, 
  SortAsc, 
  SortDesc, 
  Calendar,
  FileText,
  User,
  Tag,
  BookOpen,
  Sparkles
} from 'lucide-react';

export interface SearchFilters {
  query: string;
  author: string;
  subjectArea: string[];
  status: string[];
  dateFrom: string;
  dateTo: string;
  citationRange: [number, number];
  hasKeywords: boolean;
  hasDOI: boolean;
  openAccess: boolean;
  reviewType: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  abstract: string;
  authors: { name: string; affiliation?: string }[];
  keywords: string[];
  subject_area: string;
  status: string;
  publication_date: string;
  doi?: string;
  citations: number;
  downloads: number;
  relevanceScore: number;
}

interface EnhancedSearchProps {
  onSearch: (filters: SearchFilters, sort: string, fuzzy: boolean) => void;
  results: SearchResult[];
  loading?: boolean;
  totalResults?: number;
}


const STATUS_OPTIONS = [
  'published',
  'accepted',
  'under_review',
  'submitted'
];

const REVIEW_TYPES = [
  'peer_reviewed',
  'editorial_review',
  'fast_track'
];

export const EnhancedSearch = ({ 
  onSearch, 
  results, 
  loading, 
  totalResults = 0 
}: EnhancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    author: '',
    subjectArea: [],
    status: [],
    dateFrom: '',
    dateTo: '',
    citationRange: [0, 100],
    hasKeywords: false,
    hasDOI: false,
    openAccess: false,
    reviewType: []
  });

  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [fuzzySearch, setFuzzySearch] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);


  const handleFilterChange = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };



  const handleSearch = () => {
    const fullSort = `${sortBy}_${sortOrder}`;
    onSearch(filters, fullSort, fuzzySearch);
  };



  const saveSearch = () => {
    const searchName = `Search ${savedSearches.length + 1}`;
    const newSearch = {
      id: Date.now(),
      name: searchName,
      filters,
      sortBy,
      sortOrder,
      fuzzySearch,
      createdAt: new Date().toISOString()
    };
    setSavedSearches(prev => [...prev, newSearch]);
  };

  const loadSearch = (search: any) => {
    setFilters(search.filters);
    setSortBy(search.sortBy);
    setSortOrder(search.sortOrder);
    setFuzzySearch(search.fuzzySearch);
    handleSearch();
  };


  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles, authors, keywords..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            

            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results Header */}
      {totalResults > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalResults.toLocaleString()} results found
            {filters.query && ` for "${filters.query}"`}
          </p>

          <div className="flex items-center gap-2">
            <Label className="text-sm">Sort by:</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="citations">Citations</SelectItem>
                <SelectItem value="downloads">Downloads</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Saved Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map(search => (
                <Button
                  key={search.id}
                  variant="outline"
                  size="sm"
                  onClick={() => loadSearch(search)}
                  className="text-xs"
                >
                  {search.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};