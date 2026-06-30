# Feature 6: Enhance Partner Onboarding Statistics on the Dashboard

## Part 1

## Description

1. In `Dashboard.tsx`, the top-left panel currently displays the number of recently sent partner onboarding invitation emails. In addition to `fetchInvitationRecords()`, add another data fetch operation.

2. Send a `GET` request to the following endpoint and retrieve the data:

   ```text
   /partners/onboarding/sync-stat
   ```

3. Match the partner names by normalizing them. Convert the following SQL logic to JavaScript:

   ```sql
   REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
       lower(trim(partner)),
       'Ü', 'u'), 'ü', 'u'),
       'Ö', 'o'), 'ö', 'o'),
       'Ä', 'a'), 'ä', 'a'),
       'ß', 'ss')
   ```

## UI Requirements

* Use a different color to distinguish the synced records from the invitation records.
* Add a badge displaying the number of synced records returned by the new endpoint.


## Part 2
## Target File

**Dashboard.tsx**
**Dashboard.css**


### Description

1. Process the sample response returned by `fetchSyncStat()` in `Dashboard.jsx`.

2. Based on the sample response below, only one partner matches an invitation record. Therefore, the green badge should display **1**, since only one partner from the sync statistics matches a `group_name` from the invitation records.

3. Partners should be matched by comparing the normalized values of `partner` and `group_name` using the `normalizePartner()` function.

4. Once a matching partner is found, display the corresponding `total_records` value next to the partner title. For example, **Octavia Logistic Services L.L.C.** should display **4**, as returned by the sync statistics response.

### Sync Statistics Response

```js id="n4m2vx"
{
  "data": {
    "status": true,
    "data": [
      {
        "partner": "Octavia Logistic Services L.L.C.",
        "total_records": 4
      }
    ]
  },
  "status": true
}
```

### Invitation Records Response

```js id="5c2v0g"
{
  "data": [
    {
      "id": 1695,
      "created_at": "2026-06-22T12:59:33.000Z",
      "recipient": "[\"reimund@octavia-logistics.com\", \"office2@german-emirates-club.com\", \"maahyarazad@gmail.com\"]",
      "group_name": "Octavia Logistic Services L.L.C."
    },
    {
      "id": 1683,
      "created_at": "2026-06-22T13:00:21.000Z",
      "recipient": "[\"sushil.kumar@hydac.com\", \"office2@german-emirates-club.com\", \"maahyarazad@gmail.com\"]",
      "group_name": "HYDAC INTERNATIONAL"
    },
    {
      "id": 1684,
      "created_at": "2026-06-22T13:00:43.000Z",
      "recipient": "[\"hr@richmind.com\", \"office2@german-emirates-club.com\", \"maahyarazad@gmail.com\"]",
      "group_name": "RICHMIND"
    }
  ],
  "status": true
}
```


## Part 3

### Target Files

- **Dashboard.tsx**
- **Dashboard.css**

### Description

1. Consume the `/dashboard/app-user-stat` endpoint. The response will be in the format shown below. In the top-right corner of the dashboard, display Android and iOS icons and assign appropriate colors for each platform.

2. Present the insights in an intuitive way in the top-right section of the dashboard.

3. The `member` column represents language:
   - `0` = English speaker  
   - `1` = German speaker  

### Sample Response

```txt
member|platform|allowed_push_notification|past_year_active_login|
------+--------+-------------------------+----------------------+
     0|android |                        5|                    21|
     0|ios     |                        5|                    63|
     1|android |                        9|                    14|
     1|ios     |                       28|                    64|
```

