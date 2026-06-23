# Feature 3: Improve User and Event List Sections

## Part 1: User List

### Target Files

- **UsersList.tsx**
- **UsersList.css**

### Description

- I have already implemented `UserDataGrid.tsx`, and it is currently being rendered inside `ApprovalList.tsx` using the following code:

```jsx
<UserDataGrid toastRef={toastRef} />
```

- Move the `UserDataGrid.tsx` implementation into `UsersList.tsx`.
- Ensure all existing functionality continues to work after the refactor.
- Apply a clean and minimal design consistent with `careerViewer.tsx` and `careerViewer.css`.

---

## Part 2: Event List

### Target Files

- **EventList.tsx**
- **EventList.css**

### Description

- The **Short Description** column in the DataGrid is causing row heights to vary, which affects the consistency of the table layout.
- Replace the inline description display with a **Tooltip Description** action that displays the full description on hover.
- Ensure all DataGrid rows maintain a consistent height.
- Simplify the rating display by using plain star icons.
- Apply a clean and minimal design consistent with `careerViewer.tsx` and `careerViewer.css`.



## Part 3: Event List Tooltip Update

### Description
- use the following example from prime react and update the `{rowData.eventDescription}` in `- **EventList.tsx**`

```jsx

import React from 'react';
import { InputText } from 'primereact/inputtext';

export default function AutoHideDemo() {

    return (
        <div className="card flex flex-wrap align-items-center justify-content-center gap-2">
            <InputText type="text" placeholder="autoHide: false" tooltip="Enter your username" tooltipOptions={{ autoHide: false }} />
            <InputText type="text" placeholder="autoHide: true" tooltip="Enter your username" />
        </div>
    );
}
        
```