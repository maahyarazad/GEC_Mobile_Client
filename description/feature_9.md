# Feature 9: Enhance Partner Onboarding in Dashbaord

## Description

In the `Dashboard.tsx` the renderInvitationPanel functino needs to be updated with the new format of data as below

```txt
id  |group_name                      |all_recipients                                                                                                                                                                                                                                                 |latest_created_at  |email_batch_count|
----+--------------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-------------------+-----------------+
1247|Nathan & Nathan                 |[["abegail@nathanhr.com", "rohan@nathanhr.com", "office1@german-emirates-club.com", "office2@german-emirates-club.com"],["jane@nathanhr.com", "rohan@nathanhr.com", "office1@german-emirates-club.com", "office2@german-emirates-club.com"],["samantha@nathanhr|2026-07-02 10:32:19|                3|
1684|RICHMIND                        |[["hr@richmind.com", "office2@german-emirates-club.com", "maahyarazad@gmail.com"]]                                                                                                                                                                             |2026-06-22 15:00:43|                1|
1683|HYDAC INTERNATIONAL             |[["sushil.kumar@hydac.com", "office2@german-emirates-club.com", "maahyarazad@gmail.com"]]                                                                                                                                                                      |2026-06-22 15:00:21|                1|
1695|Octavia Logistic Services L.L.C.|[["reimund@octavia-logistics.com", "office2@german-emirates-club.com", "maahyarazad@gmail.com"]]                                                                                                                                                               |2026-06-22 14:59:33|                1|
```


# Feature 9.1: Enhance Dashboard App Users by Platform

## Description

Similar to **“Partner Onboarding Invitations”**, which displays total numbers in two circles, add the same total number display (using the same colors) to **“App Users by Platform.”**