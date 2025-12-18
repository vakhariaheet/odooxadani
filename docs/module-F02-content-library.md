# Module F02: Content Library & Upload

## Overview

**Estimated Time:** 1 hour  
**Complexity:** Medium (S3 integration, file handling)  
**Type:** Full-stack  
**Risk Level:** Low  
**Dependencies:** None (Foundation module - zero dependencies)

## Problem Context

Teachers need to upload educational content (videos, PDFs, worksheets) for students to access offline. Students need to search, preview, and download learning materials. The platform must handle low-bandwidth constraints with compressed file formats and progressive loading. This module provides the core content repository for the virtual classroom.

## Technical Requirements

### Backend Tasks

- [ ] **Handler: listContent.ts** - GET /api/content
  - Query parameters: `type` (video/pdf/worksheet), `subject`, `language`, `limit`, `lastKey`
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbac`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` + `export const handler = withRbac(baseHandler, 'content', 'read')`
  - All authenticated users can list content

- [ ] **Handler: getContent.ts** - GET /api/content/:contentId
  - Fetch content metadata from DynamoDB
  - Include presigned download URL from S3
  - Track view count increment

- [ ] **Handler: getUploadUrl.ts** - GET /api/content/upload-url
  - Generate S3 presigned upload URL for teachers
  - Import: `s3` from `shared/clients/s3`
  - Query params: `fileName`, `fileType`, `contentType`
  - Validate file size limits (max 100MB for videos, 10MB for PDFs)
  - Return: `{ uploadUrl, contentKey, expiresIn }`
  - **CRITICAL:** Use `s3.getPresignedUrl()` wrapper, NEVER import S3Client directly

- [ ] **Handler: createContent.ts** - POST /api/content
  - Body: `{ title, description, subject, language, type, s3Key, fileSize }`
  - Called after file uploaded to S3 via presigned URL
  - Store metadata in DynamoDB
  - Set uploadedBy to teacher userId from JWT

- [ ] **Handler: updateContent.ts** - PUT /api/content/:contentId
  - Update metadata (title, description, subject)
  - Only uploader teacher or admin can update
  - Use `withRbacOwn` for ownership check

- [ ] **Handler: deleteContent.ts** - DELETE /api/content/:contentId
  - Soft delete content metadata
  - Delete S3 object using `s3.delete()`
  - Only uploader or admin can delete

- [ ] **Handler: searchContent.ts** - GET /api/content/search
  - Query parameters: `query`, `subject`, `language`, `type`
  - Simple text search on title and description
  - Future: Can use DynamoDB full-text search or OpenSearch

- [ ] **Function Configs** - YAML files in `functions/`
  - `listContent.yml`, `getContent.yml`, `getUploadUrl.yml`, `createContent.yml`, `updateContent.yml`, `deleteContent.yml`, `searchContent.yml`
  - HTTP API v2 events with `clerkJwtAuthorizer`

- [ ] **Service Layer: ContentService.ts**
  - `generateUploadUrl(fileName, contentType)` - S3 presigned URL
  - `createContentMetadata(data)` - DynamoDB put with validation
  - `getContentDetails(contentId)` - Fetch with presigned download URL
  - `listContent(filters)` - Query DynamoDB with pagination
  - `searchContent(query, filters)` - Search implementation
  - `deleteContent(contentId)` - S3 delete + DynamoDB update
  - `incrementViewCount(contentId)` - Atomic counter update

- [ ] **Type Definitions: types.ts**

  ```typescript
  export interface Content {
    contentId: string;
    title: string;
    description: string;
    type: 'video' | 'pdf' | 'worksheet' | 'image' | 'audio';
    subject: string;
    language: string;
    uploadedBy: string; // teacherId
    uploaderName: string;
    s3Key: string;
    fileSize: number; // bytes
    duration?: number; // for videos in seconds
    thumbnailUrl?: string;
    viewCount: number;
    downloadCount: number;
    status: 'processing' | 'available' | 'deleted';
    createdAt: string;
    updatedAt: string;
  }

  export interface CreateContentRequest {
    title: string;
    description: string;
    type: Content['type'];
    subject: string;
    language: string;
    s3Key: string;
    fileSize: number;
    duration?: number;
  }

  export interface UploadUrlRequest {
    fileName: string;
    fileType: string; // 'video/mp4', 'application/pdf'
    contentType: string;
  }

  export interface UploadUrlResponse {
    uploadUrl: string;
    contentKey: string;
    expiresIn: number;
  }

  export interface ListContentQuery {
    type?: string;
    subject?: string;
    language?: string;
    uploadedBy?: string;
    limit?: number;
    lastKey?: string;
  }
  ```

- [ ] **RBAC Configuration: Update `config/permissions.ts`**
  - Add `'content'` to `ALL_MODULES`
  - Configure permissions:

    ```typescript
    // Teachers can create, update own, delete own content
    ac.grant('teacher')
      .createAny('content')
      .readAny('content')
      .updateOwn('content')
      .deleteOwn('content');

    // Students can only read content
    ac.grant('student').readAny('content');

    // Parents can read content
    ac.grant('parent').readAny('content');
    ```

- [ ] **AWS S3 Integration:**
  - Use `shared/clients/s3.ts` wrapper
  - Bucket: `${process.env.FILES_BUCKET}` (configured in serverless.yml)
  - S3 key pattern: `content/${teacherId}/${timestamp}-${fileName}`
  - Presigned URL expiration: 1 hour for upload, 15 minutes for download
  - **File Size Limits:**
    - Videos: 100MB max
    - PDFs: 10MB max
    - Worksheets: 5MB max

### Frontend Tasks

- [ ] **Page: ContentLibraryPage.tsx** - `/library`
  - Grid layout showing content cards
  - Filters: Type, Subject, Language
  - Search bar with debounced search
  - "Upload Content" button for teachers
  - Infinite scroll or pagination

- [ ] **Component: ContentList.tsx**
  - Grid of content cards (4 columns desktop, 2 mobile)
  - Each card: Thumbnail, Title, Type badge, Subject, Language, View count
  - Click to view details
  - Use `useApi` hook for fetching

- [ ] **Component: ContentCard.tsx** - Individual content item
  - Thumbnail image (video preview or file type icon)
  - Title, description truncated
  - Meta info: Type, Subject, Language, File size
  - View/Download buttons
  - Edit/Delete buttons (if owner or admin)

- [ ] **Component: ContentUploadForm.tsx** - Upload modal
  - shadcn/ui Form with file upload input
  - Two-step process:
    1. Get presigned URL from backend
    2. Upload file directly to S3
    3. Create metadata record
  - Progress bar during upload
  - Form fields: Title, Description, Subject, Language, File
  - Validation: File type, file size limits
  - Mobile-friendly file picker

- [ ] **Component: ContentDetails.tsx** - Full content view
  - Video player (if video type)
  - PDF viewer (if PDF type)
  - Download button
  - Related content suggestions
  - View count, upload date

- [ ] **Component: VideoPlayer.tsx** - Custom video player
  - HTML5 video element with controls
  - Quality selector (if multiple qualities available)
  - Playback speed control
  - Full-screen support
  - Mobile-friendly controls

- [ ] **Component: FileUploader.tsx** - Reusable upload widget
  - Drag-and-drop area
  - File type validation
  - Upload progress bar
  - Error handling
  - Cancel upload option

- [ ] **shadcn Components Needed:**
  - `button`, `form`, `input`, `card`, `dialog`, `progress`, `select`, `badge`, `tabs`, `tooltip`, `alert`

- [ ] **API Integration: services/contentApi.ts**
  - `fetchContent(filters)` - GET /api/content
  - `fetchContentDetails(contentId)` - GET /api/content/:contentId
  - `getUploadUrl(fileName, fileType)` - GET /api/content/upload-url
  - `uploadToS3(url, file, onProgress)` - Direct S3 upload
  - `createContent(metadata)` - POST /api/content
  - `updateContent(contentId, data)` - PUT /api/content/:contentId
  - `deleteContent(contentId)` - DELETE /api/content/:contentId
  - `searchContent(query, filters)` - GET /api/content/search

- [ ] **Hooks: useContent.ts** - React Query
  - `useContent(filters)` - List with caching
  - `useContentDetails(contentId)` - Single item
  - `useUploadContent()` - Multi-step upload mutation
  - `useDeleteContent()` - Delete mutation

- [ ] **Routing: Update App.tsx**
  - Add route `/library` → `ContentLibraryPage`
  - Add route `/library/:contentId` → `ContentDetailsPage`
  - Add route `/library/upload` → `ContentUploadPage` (teacher only)

### Database Schema (DynamoDB Single Table)

```
# Content Metadata
PK: CONTENT#<contentId>
SK: METADATA
title: string
description: string
type: string
subject: string
language: string
uploadedBy: string
uploaderName: string
s3Key: string
fileSize: number
duration: number
thumbnailUrl: string
viewCount: number
downloadCount: number
status: string
createdAt: string
updatedAt: string
GSI1PK: SUBJECT#<subject>
GSI1SK: CONTENT#<createdAt>
GSI2PK: TEACHER#<uploadedBy>
GSI2SK: CONTENT#<createdAt>
GSI3PK: TYPE#<type>
GSI3SK: CONTENT#<createdAt>

# Access Patterns:
1. List all content by subject → Query GSI1PK = SUBJECT#<subject>
2. List teacher's uploaded content → Query GSI2PK = TEACHER#<teacherId>
3. List content by type (videos, PDFs) → Query GSI3PK = TYPE#<type>
4. Get content details → Get PK = CONTENT#<contentId>
5. Search content → Scan with filter (or OpenSearch integration)
```

## External Services

### AWS S3 (File Storage)

- **Purpose:** Store uploaded videos, PDFs, worksheets
- **Setup Steps:**
  1. S3 bucket created by serverless.yml (already configured)
  2. CORS policy allows frontend uploads
  3. Use `s3` wrapper from `shared/clients/s3`
- **Environment Variables:** `FILES_BUCKET`
- **NPM Package:** Already installed (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- **Code Pattern:**

  ```typescript
  import { s3 } from '../../../shared/clients/s3';

  const uploadUrl = await s3.getPresignedUploadUrl({
    bucket: process.env.FILES_BUCKET!,
    key: `content/${teacherId}/${Date.now()}-${fileName}`,
    expiresIn: 3600,
    contentType: 'video/mp4',
  });
  ```

## Implementation Guide

### Step 0: Study Phase (MANDATORY)

**Review:**

- `backend/src/shared/clients/s3.ts` - S3 wrapper usage
- `guidelines/INFRASTRUCTURE.md` - S3 presigned URL patterns

### Step 1: Backend Implementation

**File Structure:**

```
backend/src/modules/content/
├── handlers/
│   ├── listContent.ts
│   ├── getContent.ts
│   ├── getUploadUrl.ts
│   ├── createContent.ts
│   ├── updateContent.ts
│   ├── deleteContent.ts
│   └── searchContent.ts
├── functions/
│   └── [corresponding .yml files]
├── services/
│   └── ContentService.ts
└── types.ts
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/content/
│   ├── ContentList.tsx
│   ├── ContentCard.tsx
│   ├── ContentUploadForm.tsx
│   ├── ContentDetails.tsx
│   ├── VideoPlayer.tsx
│   └── FileUploader.tsx
├── pages/content/
│   ├── ContentLibraryPage.tsx
│   ├── ContentDetailsPage.tsx
│   └── ContentUploadPage.tsx
├── hooks/
│   └── useContent.ts
└── services/
    └── contentApi.ts
```

### Step 3: Integration

- [ ] Test presigned URL generation
- [ ] Upload test file directly to S3
- [ ] Verify file appears in S3 bucket
- [ ] Test download URL generation
- [ ] Test video playback in browser

## Acceptance Criteria

- [ ] **Teacher can upload video** via presigned URL (no Lambda size limits)
- [ ] **Upload shows progress bar** during file transfer
- [ ] **Content appears in library** after successful upload
- [ ] **Student can search content** by title, subject, language
- [ ] **Student can view video** with HTML5 player
- [ ] **Student can download PDF** for offline viewing
- [ ] **File size limits enforced** - rejects oversized files
- [ ] **S3 URLs expire** - presigned URLs work for limited time only
- [ ] **View count increments** when content is accessed
- [ ] **Teacher can delete their content** - removes from S3 and DB
- [ ] **Demo Ready:** Upload video → Search → View → Download in 30 seconds
- [ ] **Mobile Responsive:** Upload and view works on smartphones

## Testing Checklist

- [ ] **Manual API Testing:**
  - Get upload URL → 200 with presigned URL
  - Upload file to S3 via presigned URL → 200 OK
  - Create content metadata → 201 Created
  - List content → See uploaded item
  - Get content details → Includes download URL
  - Download file via presigned URL → File downloads
  - Delete content → Removes from S3 and DB

- [ ] **Frontend Testing:**
  - Upload form validates file type and size
  - Progress bar shows during upload
  - Video player loads and plays video
  - Search filters content correctly
  - Mobile file picker works on Android

- [ ] **Edge Cases:**
  - Upload file >100MB → Rejected
  - Expired presigned URL → Error message
  - Deleted content → 404 Not Found

## Deployment Checklist

- [ ] **Serverless Config:** Add content functions to serverless.yml
- [ ] **S3 Bucket:** Verify FILES_BUCKET env variable set
- [ ] **CORS:** S3 bucket allows frontend origin uploads
- [ ] **IAM Permissions:** Lambda has s3:PutObject, s3:DeleteObject permissions
- [ ] **Environment Variables:** FILES_BUCKET configured

## Troubleshooting Guide

1. **Upload fails with CORS error**
   - Check S3 bucket CORS policy allows PUT from frontend origin
   - Verify presigned URL includes correct headers

2. **Video won't play**
   - Check video MIME type (must be video/mp4, video/webm)
   - Verify S3 object has public-read ACL or presigned URL
   - Test direct S3 URL in browser

3. **File size limit not enforced**
   - Validate on backend before generating presigned URL
   - Check Content-Length header in upload request

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:**
  - M07 - Multilingual Support (needs content to translate)
  - M10 - Content Review System (reviews uploaded content)
  - M11 - Adaptive Video Streaming (multiple quality versions)
- **Conflicts With:** None
