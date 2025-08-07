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

const SUBJECT_AREAS = [
  'Social Work Practice',
  'Community Development', 
  'Social Policy',
  'Mental Health',
  'Child Welfare',
  'Gerontology',
  'Disability Studies',
  'International Development',
  'Social Justice',
  'Family Studies',
  'Healthcare Social Work',
  'Substance Abuse'
];

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

  // Smart search suggestions based on query
  const searchSuggestions = useMemo(() => {
    if (!filters.query || filters.query.length < 3) return [];
    
    const suggestions = [
      'mental health interventions',
      'community development strategies',
      'child welfare policies',
      'social work practice',
      'healthcare social work',
      'disability advocacy',
      'substance abuse treatment',
      'elderly care programs'
    ];

    return suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(filters.query.toLowerCase())
    ).slice(0, 5);
  }, [filters.query]);

  const handleFilterChange = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayFilterToggle = (
    key: 'subjectArea' | 'status' | 'reviewType',
    value: string
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const handleSearch = () => {
    const fullSort = `${sortBy}_${sortOrder}`;
    onSearch(filters, fullSort, fuzzySearch);
  };

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {
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
    };
    setFilters(emptyFilters);
    onSearch(emptyFilters, sortBy + '_' + sortOrder, fuzzySearch);
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

  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    if (typeof value === 'boolean') return count + (value ? 1 : 0);
    if (typeof value === 'string') return count + (value ? 1 : 0);
    if (Array.isArray(value) && value.length === 2) {
      return count + (value[0] > 0 || value[1] < 100 ? 1 : 0);
    }
    return count;
  }, 0);

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
              
              {/* Search Suggestions */}
              {searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 bg-background border rounded-md shadow-lg mt-1">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                      onClick={() => handleFilterChange('query', suggestion)}
                    >
                      <Sparkles className="h-3 w-3 inline mr-2 text-primary" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="fuzzy"
                checked={fuzzySearch}
                onCheckedChange={(checked) => setFuzzySearch(!!checked)}
              />
              <Label htmlFor="fuzzy" className="text-sm">Fuzzy</Label>
            </div>

            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Search Filters</h4>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </div>

                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-3">
                      <div>
                        <Label>Author</Label>
                        <Input
                          placeholder="Author name..."
                          value={filters.author}
                          onChange={(e) => handleFilterChange('author', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Subject Areas</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {SUBJECT_AREAS.slice(0, 6).map(area => (
                            <div key={area} className="flex items-center space-x-2">
                              <Checkbox
                                id={area}
                                checked={filters.subjectArea.includes(area)}
                                onCheckedChange={() => handleArrayFilterToggle('subjectArea', area)}
                              />
                              <Label htmlFor={area} className="text-xs">{area}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Publication Status</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {STATUS_OPTIONS.map(status => (
                            <div key={status} className="flex items-center space-x-2">
                              <Checkbox
                                id={status}
                                checked={filters.status.includes(status)}
                                onCheckedChange={() => handleArrayFilterToggle('status', status)}
                              />
                              <Label htmlFor={status} className="text-xs capitalize">
                                {status.replace('_', ' ')}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-3">
                      <div>
                        <Label>Citation Range: {filters.citationRange[0]} - {filters.citationRange[1]}</Label>
                        <Slider
                          value={filters.citationRange}
                          onValueChange={(value) => handleFilterChange('citationRange', value as [number, number])}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasKeywords"
                            checked={filters.hasKeywords}
                            onCheckedChange={(checked) => handleFilterChange('hasKeywords', !!checked)}
                          />
                          <Label htmlFor="hasKeywords">Has Keywords</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasDOI"
                            checked={filters.hasDOI}
                            onCheckedChange={(checked) => handleFilterChange('hasDOI', !!checked)}
                          />
                          <Label htmlFor="hasDOI">Has DOI</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="openAccess"
                            checked={filters.openAccess}
                            onCheckedChange={(checked) => handleFilterChange('openAccess', !!checked)}
                          />
                          <Label htmlFor="openAccess">Open Access Only</Label>
                        </div>
                      </div>

                      <div>
                        <Label>Date Range</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <Input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            placeholder="From"
                          />
                          <Input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            placeholder="To"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="pt-3 border-t">
                    <Button onClick={saveSearch} size="sm" className="w-full">
                      Save Search
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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