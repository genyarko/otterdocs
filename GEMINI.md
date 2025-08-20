## Investor Tracking Feature

This feature allows users to keep track of investors they have pitched to.

### Implementation Details

- **Data Model**: Created an `Investor` interface in `src/types/investor.ts`.
- **API Routes**:
  - `src/app/api/investors/route.ts`: Handles `GET` and `POST` requests for investors.
  - `src/app/api/investors/[investorId]/route.ts`: Handles `PUT` and `DELETE` requests for a specific investor.
- **Frontend Components**:
  - `src/components/InvestorForm.tsx`: A form to add and edit investors.
  - `src/components/InvestorList.tsx`: A component to display a list of investors.
  - `src/components/InvestorTracker.tsx`: The main component that brings together the form and the list.
- **Integration**: The `InvestorTracker` component is integrated into the `src/components/PitchDeckViewer.tsx` component.
