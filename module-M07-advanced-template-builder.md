# Module M07: Advanced Template Builder

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Medium

**Dependencies:** F03 (Template System)

## Problem Context

Building on the basic template system, this module adds advanced template building features like drag-and-drop section builder, dynamic pricing calculators, conditional sections, and template analytics to make templates more powerful and effective.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Extend template functionality
  - `handlers/getTemplateBuilder.ts` - GET /api/templates/:id/builder (template builder data)
  - `handlers/saveTemplateSection.ts` - POST /api/templates/:id/sections (add/update sections)
  - `handlers/reorderTemplateSections.ts` - PUT /api/templates/:id/sections/reorder
  - `handlers/getTemplateAnalytics.ts` - GET /api/templates/:id/analytics
  - `handlers/duplicateTemplate.ts` - POST /api/templates/:id/duplicate

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/getTemplateBuilder.yml`
  - `functions/saveTemplateSection.yml`
  - `functions/reorderTemplateSections.yml`
  - `functions/getTemplateAnalytics.yml`
  - `functions/duplicateTemplate.yml`

- [ ] **Service Layer:** Extend TemplateService with advanced features
  - Section management (add, update, reorder, delete)
  - Template analytics tracking
  - Dynamic pricing calculation logic
  - Conditional section evaluation
  - Template performance metrics

- [ ] **Type Definitions:** Add advanced types to `types.ts`
  - TemplateSection interface (enhanced)
  - SectionType enum (text, pricing, conditional, etc.)
  - TemplateAnalytics interface
  - PricingCalculator interface
  - ConditionalLogic interface

- [ ] **AWS Service Integration:** Use existing clients
  - DynamoDB for section storage and analytics
  - Enhanced template structure storage

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*`

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Frontend Tasks

- [ ] **Components:** Build advanced template builder UI
  - `TemplateBuilder.tsx` - Drag-and-drop template builder
  - `SectionEditor.tsx` - Individual section editor
  - `SectionLibrary.tsx` - Pre-built section components
  - `PricingCalculator.tsx` - Dynamic pricing section
  - `ConditionalSection.tsx` - Conditional logic section
  - `TemplatePreview.tsx` - Real-time template preview
  - `TemplateAnalytics.tsx` - Template performance metrics

- [ ] **Enhanced Existing Components:**
  - Update `TemplateForm.tsx` to use new builder
  - Add analytics to `TemplateList.tsx`
  - Enhance `TemplateCard.tsx` with usage stats

- [ ] **shadcn Components:** drag-and-drop, tabs, accordion, slider, switch, progress

- [ ] **API Integration:** Connect to advanced template endpoints
  - Section management operations
  - Real-time preview updates
  - Analytics data fetching

- [ ] **State Management:** Complex state for builder, React Query for server state

- [ ] **Drag and Drop:** Implement section reordering
  - Use react-beautiful-dnd or similar
  - Visual feedback for drag operations
  - Section type indicators

- [ ] **Template Sections:** Pre-built section types
  - Introduction section
  - Scope of work section
  - Pricing table section
  - Timeline section
  - Terms and conditions section
  - Custom text section

- [ ] **Responsive Design:** Builder works on desktop and tablet

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Database Schema Extensions (Single Table)

```
# Template sections
pk: TEMPLATE#[id] | sk: SECTION#[sectionId] | gsi1pk: SECTION#[type] | gsi1sk: [order]

# Template analytics
pk: TEMPLATE#[id] | sk: ANALYTICS | gsi1pk: ANALYTICS#TEMPLATE | gsi1sk: [lastUpdated]

# Section library (pre-built sections)
pk: SECTION_LIBRARY | sk: SECTION#[sectionId] | gsi1pk: SECTION_TYPE#[type] | gsi1sk: [popularity]

Section Fields:
- id: string (UUID)
- templateId: string
- type: 'text' | 'pricing' | 'timeline' | 'conditional' | 'custom'
- title: string
- content: string | PricingTable | Timeline
- order: number
- isRequired: boolean
- conditionalLogic?: ConditionalLogic
- variables: string[]
- createdAt: string (ISO)
- updatedAt: string (ISO)

Analytics Fields:
- usageCount: number
- proposalsGenerated: number
- acceptanceRate: number
- averageProposalValue: number
- lastUsed: string (ISO)
- popularSections: string[] (section IDs)

PricingTable Interface:
- items: PricingItem[]
- showTotals: boolean
- allowQuantityEdit: boolean
- taxRate?: number

ConditionalLogic Interface:
- condition: string (e.g., "project_type === 'web_development'")
- showIf: boolean
- dependsOn: string[] (variable names)
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read F03 implementation to understand existing template structure.

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/templates/ (extend existing)
├── handlers/ (extend existing)
│   ├── getTemplateBuilder.ts
│   ├── saveTemplateSection.ts
│   ├── reorderTemplateSections.ts
│   ├── getTemplateAnalytics.ts
│   └── duplicateTemplate.ts
├── functions/ (extend existing)
│   └── [new function configs]
├── services/
│   └── TemplateService.ts (extend existing)
└── types.ts (extend existing)
```

**Section Management Handler:**

```typescript
// handlers/saveTemplateSection.ts
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { TemplateService } from '../services/TemplateService';

const templateService = new TemplateService();

const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const templateId = event.pathParameters?.id;
    const body = JSON.parse(event.body || '{}');
    const userId = event.auth.userid;

    const section = await templateService.saveTemplateSection(templateId!, userId, body);
    return successResponse(section);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbacOwn(baseHandler, 'templates', 'update');
```

### Step 2: Frontend Implementation

**Template Builder Component:**

```typescript
// components/templates/TemplateBuilder.tsx
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical } from 'lucide-react';

interface TemplateBuildProps {
  templateId: string;
  sections: TemplateSection[];
  onSectionUpdate: (sections: TemplateSection[]) => void;
}

export const TemplateBuilder = ({ templateId, sections, onSectionUpdate }: TemplateBuildProps) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedSections = items.map((section, index) => ({
      ...section,
      order: index
    }));

    onSectionUpdate(updatedSections);
  };

  const addSection = (type: SectionType) => {
    const newSection: TemplateSection = {
      id: generateUUID(),
      templateId,
      type,
      title: `New ${type} Section`,
      content: '',
      order: sections.length,
      isRequired: false,
      variables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSectionUpdate([...sections, newSection]);
    setEditingSection(newSection.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Template Sections</h3>
        <div className="space-x-2">
          <Button onClick={() => addSection('text')} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Text
          </Button>
          <Button onClick={() => addSection('pricing')} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Pricing
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {sections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="relative"
                    >
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div
                          {...provided.dragHandleProps}
                          className="mr-2 cursor-grab"
                        >
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </div>
                        <CardTitle className="text-sm">{section.title}</CardTitle>
                        <Button
                          onClick={() => setEditingSection(section.id)}
                          size="sm"
                          variant="outline"
                          className="ml-auto"
                        >
                          Edit
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-gray-600 truncate">
                          {section.content.toString().substring(0, 100)}...
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {editingSection && (
        <SectionEditor
          section={sections.find(s => s.id === editingSection)!}
          onSave={(updatedSection) => {
            const updatedSections = sections.map(s =>
              s.id === editingSection ? updatedSection : s
            );
            onSectionUpdate(updatedSections);
            setEditingSection(null);
          }}
          onCancel={() => setEditingSection(null)}
        />
      )}
    </div>
  );
};
```

### Step 3: Integration with F03

- [ ] Extend existing template system with new builder
- [ ] Maintain backward compatibility with simple templates
- [ ] Add migration path for existing templates

## Acceptance Criteria

- [ ] Drag-and-drop template builder works smoothly
- [ ] Multiple section types available (text, pricing, timeline, conditional)
- [ ] Section reordering updates template structure
- [ ] Template analytics show usage and performance metrics
- [ ] Real-time preview updates as sections are edited
- [ ] Pre-built section library provides quick starting points
- [ ] **Demo Ready:** Can build a complex template in 45 seconds
- [ ] **Enhanced F03:** Seamlessly extends basic template system
- [ ] **Professional Output:** Generated templates look polished
- [ ] **Desktop/Tablet:** Builder works well on larger screens

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test section CRUD operations
  - Verify section reordering
  - Test template analytics generation
  - Check template duplication

- [ ] **Frontend Testing:**
  - Test drag-and-drop functionality
  - Verify section editor works for all types
  - Test real-time preview updates
  - Check responsive design on tablet

- [ ] **Integration:** Builder integrates with existing F03 templates
- [ ] **Performance:** Complex templates load and save efficiently
- [ ] **User Experience:** Builder is intuitive and responsive

## Deployment Checklist

- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added new function imports to serverless.yml
- [ ] **Database Migration:** Section schema added to existing templates
- [ ] **Testing:** Manual testing with existing F03 templates
- [ ] **Performance:** Verified builder performance with large templates

## Troubleshooting Guide

### Common Issues

1. **Drag and Drop Not Working**
   - Check react-beautiful-dnd installation
   - Verify drag handle implementation
   - Test with simple drag operations first

2. **Section Reordering Not Persisting**
   - Check section order update logic
   - Verify DynamoDB update operations
   - Test with manual order changes

3. **Template Preview Not Updating**
   - Check real-time preview logic
   - Verify state management for sections
   - Test with simple content changes

## Related Modules

- **Depends On:** F03 (Template System)
- **Enables:** M12 (AI Proposal Optimization)
- **Integrates With:** F01 (Proposal Management) for enhanced proposal creation
- **Conflicts With:** None

## Section Types

**Available Section Types:**

1. **Text Section** - Rich text content with variables
2. **Pricing Section** - Dynamic pricing tables with calculations
3. **Timeline Section** - Project timeline with milestones
4. **Conditional Section** - Shows/hides based on variables
5. **Custom Section** - User-defined content structure

**Pre-built Section Library:**

- Professional introduction templates
- Scope of work frameworks
- Pricing table templates
- Timeline templates
- Terms and conditions templates
