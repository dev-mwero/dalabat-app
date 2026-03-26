# Pending Features - Daalabat Next.js App

This document tracks the features and improvements needed to bring the Next.js port to production readiness.

## 1. Core Logic & Backend Integration
- [ ] **Automatic Stock Management**: Update `api/orders` to decrement `product.stockQuantity` upon successful order creation.
- [ ] **M-Pesa STK Push (Automatic)**: Integrate actual M-Pesa STK push logic instead of just setting status to `pending`.
- [ ] **Checkout Validation**: Enhance `api/checkout` to perform pre-order checks (e.g., verifying stock levels before allowing the POST).

## 2. User Experience & missing Pages
- [ ] **Customer Profile/Account Page**: Create a `/profile` or `/account` route for regular users to view order history and manage details.
- [ ] **Dedicated Tracking Landing**: Replace the `/track` redirect with a proper tracking splash page or dashboard.
- [ ] **Vendor Landing Page**: Replace the `/vendor` redirect with a professional landing page for potential new vendors.

## 3. Feedback & Engagement
- [ ] **Reviews UI**: Implement the frontend components for the existing `api/reviews` logic on Product and Vendor pages.
- [ ] **Vendor Review Management**: Add a "Reviews" tab to the Vendor Portal for responding to customer feedback.

## 4. Search & Discovery
- [ ] **Advanced Filtering**: Add price range, rating, and vendor attribute filters to the home page product search.
- [ ] **Search Suggestions**: Implement a "fuzzy" search or suggestions dropdown in the Header.

## 5. Technical Improvements
- [ ] **CDN Assets**: Move local placeholder images to a permanent CDN or optimized cloud storage.
- [ ] **Analytics Refinement**: Implement more complex vendor metrics (Conversion rates, Customer retention) in the Analytics dashboard.
