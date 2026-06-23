
# Feature 2: Improve Career Page Style

## Target Files

- **careerViewer.tsx**
- **careerViewer.css**

## Description

- Keep the DataGrid and pagination within a fixed page height to prevent layout shifts while navigating between pages.
- Improve the overall UI and visual appearance of the Career Viewer page.
- Fix the rating stars display issue, as they are currently not rendering correctly.
- Ensure the rating component is properly aligned and responsive across different screen sizes.

## Part 2

## Target Files

- **careerViewer.tsx**
- **careerViewer.css**

### Description

- The **Message** column in the DataGrid is causing row heights to vary, which affects the overall consistency of the table layout.
- Replace the inline message display with a **View Message** action that opens the full message inside a modal.
- Ensure all DataGrid rows maintain a consistent height.
- Simplify the rating display by using plain star icons.
- Remove the circular/border-radius styling around the rating icons.
- Use a clean and minimal rating design that matches the overall UI style.


## Part 3

### Target Files

- **careerViewer.tsx**
- **careerViewer.css**

### Description

- In the **Message** column of the DataGrid, do not display the **View Message** button when no message is available.

