# Feature 4: Implement Dashboard Items

## Description

- First, add a dashboard route to `App.jsx`.
- Use the following data format and add an API call to fetch data from the server endpoint:

  `/partners/onboarding/invitation-records`

### Sample Data Format

```txt
id    created_at              recipient                                                                 group_name
1695  2026-06-22 14:59:33     ["reimund@octavia-logistics.com", "office2@german-emirates-club.com", "maahyarazad@gmail.com"]   Octavia Logistic Services L.L.C.
1683  2026-06-22 15:00:21     ["sushil.kumar@hydac.com", "office2@german-emirates-club.com", "maahyarazad@gmail.com"]           HYDAC INTERNATIONAL
1684  2026-06-22 15:00:43     ["hr@richmind.com", "office2@german-emirates-club.com", "maahyarazad@gmail.com"]                   RICHMIND
```

### UI Requirements
- Divide the dashboard into four sections.
- Display this data in the top-left section.
- Ensure this section has vertical scrolling (overflow: auto) since the data will grow over time.
- Show only the latest 3 records by default.
- Also display the total number of records.