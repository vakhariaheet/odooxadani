/**
 * OpenSearch Client Wrapper
 * 
 * Type-safe wrapper around OpenSearch Client
 * with common operations for search and indexing.
 */

import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { createLogger } from '../logger';

const logger = createLogger('OpenSearchClient');

// =============================================================================
// CLIENT INITIALIZATION
// =============================================================================

const createOpenSearchClient = (): Client => {
  const endpoint = process.env['OPENSEARCH_ENDPOINT'];
  const region = process.env['AWS_REGION'] || process.env['REGION'] || 'ap-south-1';

  if (!endpoint) {
    logger.warn('OpenSearch endpoint not configured');
    // Return a client that will fail on first request
    return new Client({ node: 'https://localhost:9200' });
  }

  // Use AWS Signature V4 for authentication
  return new Client({
    ...AwsSigv4Signer({
      region,
      service: 'es', // Use 'es' for Amazon OpenSearch Service
      getCredentials: () => defaultProvider()(),
    }),
    node: endpoint,
  });
};

const client = createOpenSearchClient();

// =============================================================================
// TYPES
// =============================================================================

export interface SearchOptions {
  from?: number;
  size?: number;
  sort?: Array<Record<string, { order: 'asc' | 'desc' }>>;
  source?: string[] | boolean;
  highlight?: {
    fields: Record<string, object>;
    preTags?: string[];
    postTags?: string[];
  };
}

export interface SearchResult<T> {
  hits: Array<{
    id: string;
    score: number;
    source: T;
    highlight?: Record<string, string[]>;
  }>;
  total: number;
  took: number;
  maxScore: number | null;
}

export interface BulkOperation<T> {
  action: 'index' | 'create' | 'update' | 'delete';
  id: string;
  document?: T;
}

export interface BulkResult {
  took: number;
  errors: boolean;
  items: Array<{
    action: string;
    id: string;
    result: string;
    status: number;
    error?: {
      type: string;
      reason: string;
    };
  }>;
}

export interface IndexSettings {
  numberOfShards?: number;
  numberOfReplicas?: number;
  analysis?: Record<string, unknown>;
}

// =============================================================================
// OPENSEARCH CLIENT CLASS
// =============================================================================

export class OpenSearch {
  private indexName: string;

  constructor(indexName?: string) {
    this.indexName = indexName || process.env['OPENSEARCH_INDEX'] || '';
    if (!this.indexName) {
      logger.warn('OpenSearch index name not configured');
    }
  }

  /**
   * Create a new OpenSearch instance for a different index
   */
  forIndex(indexName: string): OpenSearch {
    return new OpenSearch(indexName);
  }

  // ===========================================================================
  // DOCUMENT OPERATIONS
  // ===========================================================================

  /**
   * Index (create or update) a document
   */
  async index<T extends Record<string, unknown>>(id: string, document: T, refresh?: boolean): Promise<void> {
    try {
      await client.index({
        index: this.indexName,
        id,
        body: document as Record<string, unknown>,
        refresh: refresh ? 'true' : 'false',
      });
      logger.debug('OpenSearch index success', { id });
    } catch (error) {
      logger.error('OpenSearch index failed', error, { id });
      throw error;
    }
  }

  /**
   * Get a document by ID
   */
  async get<T>(id: string): Promise<T | null> {
    try {
      const response = await client.get({
        index: this.indexName,
        id,
      });
      return response.body._source as T;
    } catch (error: unknown) {
      const errorResponse = error as { meta?: { statusCode?: number } };
      if (errorResponse.meta?.statusCode === 404) {
        return null;
      }
      logger.error('OpenSearch get failed', error, { id });
      throw error;
    }
  }

  /**
   * Delete a document by ID
   */
  async delete(id: string, refresh?: boolean): Promise<boolean> {
    try {
      const response = await client.delete({
        index: this.indexName,
        id,
        refresh: refresh ? 'true' : 'false',
      });
      return response.body.result === 'deleted';
    } catch (error: unknown) {
      const errorResponse = error as { meta?: { statusCode?: number } };
      if (errorResponse.meta?.statusCode === 404) {
        return false;
      }
      logger.error('OpenSearch delete failed', error, { id });
      throw error;
    }
  }

  /**
   * Update a document (partial update)
   */
  async update<T>(id: string, updates: Partial<T>, refresh?: boolean): Promise<void> {
    try {
      await client.update({
        index: this.indexName,
        id,
        body: {
          doc: updates,
        },
        refresh: refresh ? 'true' : 'false',
      });
      logger.debug('OpenSearch update success', { id });
    } catch (error) {
      logger.error('OpenSearch update failed', error, { id });
      throw error;
    }
  }

  /**
   * Check if a document exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const response = await client.exists({
        index: this.indexName,
        id,
      });
      return response.body as boolean;
    } catch (error) {
      logger.error('OpenSearch exists check failed', error, { id });
      throw error;
    }
  }

  // ===========================================================================
  // SEARCH OPERATIONS
  // ===========================================================================

  /**
   * Search documents with query DSL
   */
  async search<T>(query: Record<string, unknown>, options?: SearchOptions): Promise<SearchResult<T>> {
    const body: Record<string, unknown> = {
      query,
      from: options?.from || 0,
      size: options?.size || 10,
    };

    if (options?.sort) {
      body['sort'] = options.sort;
    }

    if (options?.source !== undefined) {
      body['_source'] = options.source;
    }

    if (options?.highlight) {
      body['highlight'] = options.highlight;
    }

    try {
      const response = await client.search({
        index: this.indexName,
        body,
      });

      const hits = response.body.hits;
      
      return {
        hits: hits.hits.map((hit: Record<string, unknown>) => ({
          id: hit['_id'] as string,
          score: (hit['_score'] as number) || 0,
          source: hit['_source'] as T,
          highlight: hit['highlight'] as Record<string, string[]> | undefined,
        })),
        total: typeof hits.total === 'number' ? hits.total : (hits.total?.value ?? 0),
        took: response.body.took,
        maxScore: typeof hits.max_score === 'number' ? hits.max_score : null,
      };
    } catch (error) {
      logger.error('OpenSearch search failed', error);
      throw error;
    }
  }

  /**
   * Simple text search across fields
   */
  async textSearch<T>(
    text: string,
    fields: string[],
    options?: SearchOptions
  ): Promise<SearchResult<T>> {
    const query = {
      multi_match: {
        query: text,
        fields,
        type: 'best_fields',
        fuzziness: 'AUTO',
      },
    };
    return this.search<T>(query, options);
  }

  /**
   * Search with match query on a single field
   */
  async match<T>(field: string, value: string, options?: SearchOptions): Promise<SearchResult<T>> {
    const query = {
      match: {
        [field]: value,
      },
    };
    return this.search<T>(query, options);
  }

  /**
   * Search with term query (exact match)
   */
  async term<T>(field: string, value: string | number | boolean, options?: SearchOptions): Promise<SearchResult<T>> {
    const query = {
      term: {
        [field]: value,
      },
    };
    return this.search<T>(query, options);
  }

  /**
   * Search with bool query
   */
  async boolSearch<T>(
    conditions: {
      must?: Record<string, unknown>[];
      should?: Record<string, unknown>[];
      mustNot?: Record<string, unknown>[];
      filter?: Record<string, unknown>[];
      minimumShouldMatch?: number;
    },
    options?: SearchOptions
  ): Promise<SearchResult<T>> {
    const query = {
      bool: {
        must: conditions.must,
        should: conditions.should,
        must_not: conditions.mustNot,
        filter: conditions.filter,
        minimum_should_match: conditions.minimumShouldMatch,
      },
    };
    return this.search<T>(query, options);
  }

  /**
   * Count documents matching a query
   */
  async count(query?: Record<string, unknown>): Promise<number> {
    try {
      const response = await client.count({
        index: this.indexName,
        body: query ? { query } : undefined,
      });
      return response.body.count;
    } catch (error) {
      logger.error('OpenSearch count failed', error);
      throw error;
    }
  }

  // ===========================================================================
  // BULK OPERATIONS
  // ===========================================================================

  /**
   * Perform bulk operations
   */
  async bulk<T>(operations: BulkOperation<T>[], refresh?: boolean): Promise<BulkResult> {
    const body: Record<string, unknown>[] = [];

    for (const op of operations) {
      switch (op.action) {
        case 'index':
          body.push({ index: { _index: this.indexName, _id: op.id } });
          body.push(op.document as Record<string, unknown>);
          break;
        case 'create':
          body.push({ create: { _index: this.indexName, _id: op.id } });
          body.push(op.document as Record<string, unknown>);
          break;
        case 'update':
          body.push({ update: { _index: this.indexName, _id: op.id } });
          body.push({ doc: op.document });
          break;
        case 'delete':
          body.push({ delete: { _index: this.indexName, _id: op.id } });
          break;
      }
    }

    try {
      const response = await client.bulk({
        body,
        refresh: refresh ? 'true' : 'false',
      });

      const items = response.body.items.map((item: Record<string, unknown>) => {
        const action = Object.keys(item)[0] || '';
        const data = item[action] as Record<string, unknown> | undefined;
        return {
          action,
          id: (data?.['_id'] as string) || '',
          result: (data?.['result'] as string) || '',
          status: (data?.['status'] as number) || 0,
          error: data?.['error'] as { type: string; reason: string } | undefined,
        };
      });

      const result: BulkResult = {
        took: response.body.took,
        errors: response.body.errors,
        items,
      };

      if (result.errors) {
        logger.warn('OpenSearch bulk completed with errors', { 
          errorCount: items.filter((i) => i.error).length 
        });
      }

      return result;
    } catch (error) {
      logger.error('OpenSearch bulk failed', error);
      throw error;
    }
  }

  // ===========================================================================
  // INDEX MANAGEMENT
  // ===========================================================================

  /**
   * Create an index with mappings
   */
  async createIndex(mappings?: Record<string, unknown>, settings?: IndexSettings): Promise<void> {
    try {
      await client.indices.create({
        index: this.indexName,
        body: {
          settings: {
            number_of_shards: settings?.numberOfShards || 1,
            number_of_replicas: settings?.numberOfReplicas || 1,
            analysis: settings?.analysis,
          },
          mappings,
        },
      });
      logger.info('OpenSearch index created', { index: this.indexName });
    } catch (error) {
      logger.error('OpenSearch createIndex failed', error);
      throw error;
    }
  }

  /**
   * Delete an index
   */
  async deleteIndex(): Promise<void> {
    try {
      await client.indices.delete({
        index: this.indexName,
      });
      logger.info('OpenSearch index deleted', { index: this.indexName });
    } catch (error) {
      logger.error('OpenSearch deleteIndex failed', error);
      throw error;
    }
  }

  /**
   * Check if index exists
   */
  async indexExists(): Promise<boolean> {
    try {
      const response = await client.indices.exists({
        index: this.indexName,
      });
      return response.body as boolean;
    } catch (error) {
      logger.error('OpenSearch indexExists failed', error);
      throw error;
    }
  }

  /**
   * Update index mappings
   */
  async updateMappings(mappings: Record<string, unknown>): Promise<void> {
    try {
      await client.indices.putMapping({
        index: this.indexName,
        body: mappings,
      });
      logger.info('OpenSearch mappings updated', { index: this.indexName });
    } catch (error) {
      logger.error('OpenSearch updateMappings failed', error);
      throw error;
    }
  }

  /**
   * Refresh index (make recent changes searchable)
   */
  async refresh(): Promise<void> {
    try {
      await client.indices.refresh({
        index: this.indexName,
      });
    } catch (error) {
      logger.error('OpenSearch refresh failed', error);
      throw error;
    }
  }
}

// Default instance
export const opensearch = new OpenSearch();

export default opensearch;
