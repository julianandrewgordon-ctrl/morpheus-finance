# Cloudscape Components Reference

Quick reference for all Cloudscape components used in the Personal Finance Manager.

## Layout Components

### AppLayout
**Location**: `App.jsx`
**Purpose**: Main application shell with navigation and content areas
**Props Used**:
- `navigation` - Side navigation component
- `navigationOpen` - Controls sidebar visibility
- `content` - Main content area
- `toolsHide` - Hides the tools panel
- `contentType="default"` - Standard content layout

### TopNavigation
**Location**: `App.jsx`
**Purpose**: Header bar with branding and utilities
**Props Used**:
- `identity` - App title and logo
- `utilities` - Profile dropdown menu

### SideNavigation
**Location**: `App.jsx`
**Purpose**: Left sidebar navigation menu
**Props Used**:
- `activeHref` - Currently active page
- `header` - Navigation header
- `items` - Navigation menu items
- `onFollow` - Click handler for navigation

## Container Components

### Container
**Locations**: Dashboard, Export
**Purpose**: Content containers with optional headers
**Props Used**:
- `header` - Container header with title and actions

### SpaceBetween
**Locations**: All components
**Purpose**: Flexible spacing between elements
**Props Used**:
- `size` - Spacing size (xs, s, m, l, xl)
- `direction` - horizontal or vertical

### Grid / ColumnLayout
**Location**: Dashboard
**Purpose**: Responsive grid layouts
**Props Used**:
- `columns` - Number of columns
- `variant` - Layout variant

## Data Display Components

### Table
**Locations**: CashFlowTable, RecurringRules
**Purpose**: Advanced data tables
**Props Used**:
- `columnDefinitions` - Column configuration
- `items` - Data rows
- `variant` - Table style (embedded, full-page)
- `stickyHeader` - Sticky header on scroll
- `stripedRows` - Alternating row colors
- `header` - Table header with actions
- `filter` - Filter controls
- `empty` - Empty state content

**Column Definition Properties**:
- `id` - Unique column identifier
- `header` - Column header text
- `cell` - Cell render function
- `width` - Column width
- `minWidth` - Minimum column width

### Box
**Locations**: All components
**Purpose**: Flexible content wrapper with typography
**Props Used**:
- `variant` - Typography variant (h1, p, span, small, etc.)
- `color` - Text color (text-status-success, text-status-error, etc.)
- `fontSize` - Font size (display-l, body-s, etc.)
- `margin` - Margin spacing
- `textAlign` - Text alignment

### Badge
**Location**: RecurringRules
**Purpose**: Status badges and labels
**Props Used**:
- `color` - Badge color (blue, green, red, etc.)
- Children - Badge text

### Popover
**Location**: CashFlowTable
**Purpose**: Hover tooltips and popovers
**Props Used**:
- `dismissButton` - Show/hide dismiss button
- `position` - Popover position (top, bottom, left, right)
- `size` - Popover size
- `triggerType` - Trigger type (custom, text)
- `content` - Popover content

## Form Components

### FormField
**Locations**: QuickAddModal, Export
**Purpose**: Form field wrapper with label
**Props Used**:
- `label` - Field label
- `constraintText` - Help text below field

### Input
**Locations**: QuickAddModal, Export
**Purpose**: Text and number inputs
**Props Used**:
- `value` - Input value
- `onChange` - Change handler
- `type` - Input type (text, number)
- `placeholder` - Placeholder text
- `readOnly` - Read-only state

### Select
**Locations**: QuickAddModal, Export, RecurringRules
**Purpose**: Dropdown selectors
**Props Used**:
- `selectedOption` - Currently selected option
- `onChange` - Change handler
- `options` - Array of options
- `placeholder` - Placeholder text

**Option Format**:
```javascript
{ label: 'Display Text', value: 'value' }
```

### RadioGroup
**Location**: QuickAddModal
**Purpose**: Radio button groups
**Props Used**:
- `value` - Selected value
- `onChange` - Change handler
- `items` - Array of radio options

**Item Format**:
```javascript
{ value: 'value', label: 'Display Text' }
```

### Checkbox
**Locations**: QuickAddModal, Export, RecurringRules
**Purpose**: Checkboxes with labels
**Props Used**:
- `checked` - Checked state
- `onChange` - Change handler
- Children - Checkbox label

### DatePicker
**Locations**: QuickAddModal, Export
**Purpose**: Calendar date picker
**Props Used**:
- `value` - Date value (YYYY/MM/DD format)
- `onChange` - Change handler
- `placeholder` - Placeholder text

### Textarea
**Location**: QuickAddModal
**Purpose**: Multi-line text input
**Props Used**:
- `value` - Textarea value
- `onChange` - Change handler
- `placeholder` - Placeholder text
- `rows` - Number of rows

### TextFilter
**Location**: RecurringRules
**Purpose**: Search/filter input
**Props Used**:
- `filteringText` - Current filter text
- `filteringPlaceholder` - Placeholder text
- `filteringAriaLabel` - Accessibility label
- `onChange` - Change handler

## Action Components

### Button
**Locations**: All components
**Purpose**: Buttons for actions
**Props Used**:
- `variant` - Button style (primary, normal, link, icon)
- `iconName` - Icon name from Cloudscape icons
- `onClick` - Click handler
- `disabled` - Disabled state

**Common Icon Names**:
- `add-plus` - Plus icon
- `download` - Download icon
- `edit` - Edit icon
- `remove` - Delete icon
- `angle-left` / `angle-right` - Arrow icons
- `user-profile` - Profile icon

### ButtonDropdown
**Location**: RecurringRules
**Purpose**: Dropdown action menus
**Props Used**:
- `items` - Array of menu items
- `variant` - Button variant
- Children - Button text

**Item Format**:
```javascript
{ text: 'Action', id: 'action-id', iconName: 'icon-name' }
```

### Modal
**Location**: QuickAddModal
**Purpose**: Dialog modals
**Props Used**:
- `onDismiss` - Close handler
- `visible` - Visibility state
- `header` - Modal header text
- `footer` - Modal footer content
- Children - Modal body content

### Header
**Locations**: Dashboard, RecurringRules, Export
**Purpose**: Section headers with actions
**Props Used**:
- `variant` - Header size (h1, h2, h3)
- `description` - Header description text
- `actions` - Action buttons
- `counter` - Item counter
- Children - Header text

## Color Tokens

### Text Colors
- `text-status-success` - Green (for income/positive)
- `text-status-error` - Red (for expenses/negative)
- `text-body-secondary` - Gray (for secondary text)
- `text-status-info` - Blue (for info)
- `text-status-warning` - Orange (for warnings)

### Badge Colors
- `blue` - Blue badge
- `green` - Green badge
- `red` - Red badge
- `grey` - Gray badge

## Typography Variants

### Box Variants
- `h1`, `h2`, `h3` - Headings
- `p` - Paragraph
- `span` - Inline text
- `small` - Small text
- `strong` - Bold text
- `awsui-key-label` - Key-value label

### Font Sizes
- `display-l` - Extra large display text
- `heading-xl`, `heading-l`, `heading-m`, `heading-s` - Heading sizes
- `body-m`, `body-s` - Body text sizes

## Common Patterns

### Container with Header and Actions
```jsx
<Container
  header={
    <Header
      variant="h2"
      actions={<Button variant="primary">Action</Button>}
    >
      Section Title
    </Header>
  }
>
  Content here
</Container>
```

### Table with Filtering
```jsx
<Table
  columnDefinitions={columns}
  items={filteredItems}
  header={<Header counter={`(${count})`}>Table Title</Header>}
  filter={
    <TextFilter
      filteringText={text}
      onChange={({ detail }) => setText(detail.filteringText)}
    />
  }
/>
```

### Form Field with Input
```jsx
<FormField label="Field Label" constraintText="Help text">
  <Input
    value={value}
    onChange={({ detail }) => setValue(detail.value)}
    placeholder="Enter value"
  />
</FormField>
```

### Modal with Form
```jsx
<Modal
  visible={visible}
  onDismiss={onClose}
  header="Modal Title"
  footer={
    <Box float="right">
      <SpaceBetween direction="horizontal" size="xs">
        <Button variant="link" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onSubmit}>Submit</Button>
      </SpaceBetween>
    </Box>
  }
>
  <SpaceBetween size="m">
    {/* Form fields here */}
  </SpaceBetween>
</Modal>
```

## Resources

- **Component Documentation**: https://cloudscape.design/components/
- **Design Tokens**: https://cloudscape.design/foundation/visual-foundation/design-tokens/
- **Patterns**: https://cloudscape.design/patterns/
- **Icons**: https://cloudscape.design/foundation/visual-foundation/icons/

## Tips

1. **Always use SpaceBetween** for consistent spacing between elements
2. **Use Box for typography** instead of raw HTML elements
3. **Leverage color tokens** for consistent theming
4. **Use FormField** to wrap all form inputs for proper labels
5. **Add constraintText** to form fields for helpful hints
6. **Use variant="primary"** for main actions
7. **Add iconName** to buttons for better UX
8. **Use sticky headers** on tables for better scrolling
9. **Add empty states** to all tables
10. **Use popovers** for additional information on hover
