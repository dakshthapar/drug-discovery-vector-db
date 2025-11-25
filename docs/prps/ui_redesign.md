# 🚀 PRP — UI Redesign & API Explorer UI Implementation (Antigravity-Ready Document)

**Goal:**
Implement an extremely clean, minimal, aesthetic, responsive, scalable UI for both:

- **Home Page** (“Insert Vector”, “Search k-NN”, “Stats”, “Load Collection”)
- **API Explorer Page** (Swagger-like interactive docs)

UI must be component-driven, with little to no data leakage, consistent styling, smooth micro-interactions, and fully aligned with the rest of the repo.

## 1. High-Level Requirements

### 1.1 Home Page

Implement the following sections:

- **Insert Vector**
- **Search / KNN Query**
- **Stats Overview**
- **Load Collection**

Each must be placed in individual “Card” components inside a clean, centered page container.

### 1.2 API Explorer Page

Implement a complete Swagger-like interactive explorer:

- Endpoint sidebar
- Endpoint details pane
- Parameters table
- Request/response schemas
- “Try It Out” with live input + response viewer
- Collapsible sections
- Code blocks with copy button

### 1.3 Aesthetic Requirements

- Minimal
- A lot of whitespace
- Modern typography
- Smooth, subtle animations
- Clean borders & soft shadows
- Responsive layout
- Dark-mode ready in styling architecture (actual DM optional)

## 2. UI Architecture Standards

### 2.1 Directory Structure

Follow this exact structure:

```
src/
  pages/
    Home/
      index.tsx
    ApiDocs/
      index.tsx
  components/
    layout/
      PageContainer.tsx
      SectionHeader.tsx
      Card.tsx
    home/
      InsertVectorForm.tsx
      SearchKNNForm.tsx
      StatsPanel.tsx
      LoadCollectionForm.tsx
    api/
      EndpointGroup.tsx
      EndpointItem.tsx
      EndpointDetails.tsx
      ParamsTable.tsx
      TryItOut.tsx
      ResponseViewer.tsx
      CodeBlock.tsx
      Badge.tsx
  store/
    apiSpecStore.ts
  hooks/
    useApiSpec.ts
    useTryItOut.ts
  utils/
    jsonFormat.ts
    buildRequest.ts
  styles/
    tokens.ts
    theme.ts
```

This must be adhered to exactly for consistency.

## 3. Detailed Requirements Per Component

### 3.1 PageContainer

- Max-width: 1100px
- Auto-centered
- Padding: 2rem–3rem
- Soft fade-in animation (opacity 0 → 1, 200ms)
- Mobile responsive

### 3.2 Card

Reusable, universal card.

Visual spec:
- Background: #ffffff
- Border: 1px solid #e5e7eb
- Radius: 12px
- Padding: 24px
- Shadow: 0px 1px 2px rgba(0,0,0,0.06)
- Hover: subtle elevate (translateY(-1px), 120ms)
- Margin-bottom between cards: 24px

### 3.3 SectionHeader

Contains:
- Title (font 22, semibold)
- Subtitle (muted gray, font 14)
- Bottom margin: 12px

### 3.4 InsertVectorForm

Inputs:
- Vector ID (string)
- Vector values textarea (JSON array)
- Metadata textarea (optional JSON)
- Submit button

Behaviors:
- JSON validation with instant error hints
- JSON auto-pretty-print
- Auto-expand textarea
- Submit triggers backend API
- Success → subtle toast
- Failure → red inline alert

Edge cases:
- Invalid JSON
- Missing vector values
- Vector containing non-numerical values
- Large metadata object

### 3.5 SearchKNNForm

Inputs:
- Query vector textarea (JSON)
- K value (slider + numeric input)
- Filter metadata (optional JSON)

Output:
- Results displayed in a clean grid with small cards

Each result card shows:
- ID
- Distance score
- Metadata summary

Edge cases:
- K < 1
- Empty vector
- Invalid JSON
- Vector dimension mismatch

### 3.6 StatsPanel

Show metrics:
- total vectors
- total collections
- average dimension
- uptime
- last update time

UI:
- Four small cards in grid (2×2 desktop, 1×4 mobile)
- Soft background blocks (#f9fafb)
- Icons optional, small 18px

### 3.7 LoadCollectionForm

- Dropdown of collections
- Trigger load & analysis
- Show:
    - total vectors
    - dimension
    - memory footprint

Edge cases:
- No collections
- Invalid collection
- Loading failure

## 4. API Explorer Page Requirements

### 4.1 Sidebar (EndpointGroup / EndpointItem)

**EndpointGroup**
- Collapsible section per route group
- Title = path prefix
- Chevron rotates (smooth, 150ms)
- Group padding 12px

**EndpointItem**
- Show:
    - HTTP method badge
    - Path
    - Summary text
- Hover: subtle gray background
- On click → highlight + load details

### 4.2 EndpointDetails

Contains:
- Summary + description
- Parameters Table
- Request Body Schema
- Example Request
- Example Response
- “Try It Out” interactive panel

Smooth fade-in for each section.
Use consistent spacing.

### 4.3 ParamsTable

Table rules:
- No hard borders
- Only bottom row separators

Columns:
- Name
- Type
- Required?
- Description

Must be mobile-friendly with vertical stacking on small screens.

### 4.4 CodeBlock

Requirements:
- Syntax highlighting
- Soft rounded background (#f3f4f6)
- Monospace font
- Copy button on hover
- Horizontal scroll if needed
- Fade-in animation

### 4.5 Badge

Used for HTTP methods, status codes.

Colors:
- GET: teal
- POST: blue
- DELETE: red
- PUT: amber

Rounded chips, small text.

### 4.6 TryItOut

Inputs:
- Path params
- Query params
- JSON body

Behavior:
- Validates JSON before sending
- Build full request URL
- Send request
- Display response in ResponseViewer

Visual:
- Buttons large and clear
- JSON editor auto-indent
- Good whitespace

### 4.7 ResponseViewer

Show:
- Status code badge
- Response time (ms)
- Pretty JSON

Tabs: Raw / Pretty
Animated expand

## 5. State Management Standards

**Global state (using Zustand or equivalent)**

Only:
- apiSpec
- loading
- error

**Local state (Component-level)**

- Form inputs
- Expand/collapse UI states
- Selected endpoint
- Response JSON
- Errors

NEVER pass unnecessary props.

## 6. Coding Standards

### 6.1 Code Style

- React + TSX
- Functional components
- Must use hooks
- No class components
- Component files <= 200 lines
- Avoid prop drilling
- Use absolute imports
- Use interfaces for props
- Strong typing everywhere
- No any allowed

### 6.2 Styling

- Prefer TailwindCSS
- Design-token based palette
- Color tokens stored in `styles/tokens.ts`
- Spacing scale: 4/8/12/16/24/32
- Typography scale: 14/16/18/22

### 6.3 Animations

Only small transitions:
- Fade (200ms)
- Scale button press (80ms)
- Accordion slide (120ms)
- Hover elevation (100ms)

### 6.4 Quality Requirements

- Must render perfectly on mobile, tablet, desktop
- Must safely handle broken JSON
- Must survive backend timeouts and errors gracefully
- Must degrade gracefully when spec has no endpoints

## 7. Integration Requirements

- Connect Home Page UI to existing backend endpoints:
    - `POST /vectors`
    - `GET /stats`
    - `POST /search`
    - `GET /collections`
    - `POST /load`
- `/api/spec` must drive API Explorer
- Must use existing fetch utilities if present, else create new ones
- All network errors must show subtle error notices

## 8. Edge Cases to Handle

**For Insert Vector:**
- Empty ID
- Invalid JSON
- Very high dimensional vectors
- Empty metadata

**For Search:**
- Query vector missing
- Query vector not an array
- K > total vectors
- Backend returns empty array

**For Stats:**
- 0 vectors
- Missing fields
- Backend error

**For API Explorer:**
- Endpoint missing schemas
- Request body optional
- Unknown HTTP method
- Backend offline

## 9. Deliverables

Antigravity must generate:

- ✔️ All pages (Home + API Explorer)
- ✔️ All components
- ✔️ Complete styling + design tokens
- ✔️ All hooks & store logic
- ✔️ Full integration with backend
- ✔️ Pixel-perfect UI matching these specifications
- ✔️ Fully functional forms and interactive panels

## 10. Acceptance Criteria

- UI is minimal, professional, aesthetic
- All pages responsive
- Animations subtle and consistent
- API Explorer fully interactive
- Home Page fully functional
- Code is clean, modular, and consistent
- No UI bugs or broken layouts
- No unhandled JSON parsing errors
- No prop drilling
- No dead code
- No console warnings
