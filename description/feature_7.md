# Feature 6: Enhance Contact Table in Partner Onboarding

## Description

### 1. Update Contact Selection Logic

The `ContactTable.tsx` component already contains the initial implementation. When the user clicks the **Options** button, they should be able to choose whether to add the selected contact to either the **Recipients** or **CC** list.

### 2. Propagate Recipient and CC Data

Update `ContactTable.tsx` so that it manages both the **Recipients** and **CC** selections and passes the updated data back to `PartnerOnboarding.tsx` through the existing callback.

```jsx
<ContactTable
    contactList={contactList}
    ref={contactTableRef}
    onChangeSelected={handleShowSelected}
/>
```

`PartnerOnboarding.tsx` should then use this data when sending the API request to the server.

### 3. Improve ContactTable UI

- Unify the action buttons in `ContactTable.tsx`.
- Use consistent PrimeReact button styles.
- Keep the buttons compact (`small` size).
- Improve the overall layout to better match the application's UI design.

### 4. Improve PartnerOnboarding UI

Refine the overall design of `PartnerOnboarding.tsx` by:

- Unifying the color scheme.
- Making spacing and alignment more consistent.
- Ensuring form elements follow the application's overall UI/UX design guidelines.


# Bug/Improvement: Enhance Contact Table in Partner Onboarding

## Description

### 1. Update Contact Selection Logic

In the `ContactTable.tsx` component, implement the following behavior:

- Clicking the **Recipient** action should add the selected contact to the **Recipient** list.
- If the contact is already in the **Recipient** list, the **Recipient** button should be disabled.
- The **Recipient** input field should display the selected contacts as removable email tags, similar to a multi-select dropdown.
- Apply the same behavior to the **CC** list:
  - Clicking the **CC** action should add the selected contact to the **CC** list.
  - If the contact is already in the **CC** list, the **CC** button should be disabled.
  - The **CC** input field should also display removable email tags.
- Both the **Recipient** and **CC** lists should contain contact objects and be converted to the required format when submitting the request to the server.