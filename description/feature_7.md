# Feature 6: Enhance Partner Details Edit Component

## Description

1. In `PartnerDetailsEdit.tsx`, after `handleUpdate` successfully updates the partner details, automatically navigate back to the **OfferList** tab in `PartnerDetails.tsx`.
2. Refetch the updated partner data after returning to the **OfferList** tab to ensure the latest information is displayed.
3. Review `PartnerDetailsEdit.tsx` for potential memory leaks and performance issues, then apply the necessary optimizations and fixes.
4. Replace the current loading indicator:

   ```tsx
   {isLoading ? (<LoadingSpinner />) : ...}
   ```