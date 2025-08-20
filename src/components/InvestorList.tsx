
import { Investor } from '@/types/investor';

interface InvestorListProps {
  investors: Investor[];
  onEdit: (investor: Investor) => void;
  onDelete: (investorId: string) => void;
}

export default function InvestorList({ investors, onEdit, onDelete }: InvestorListProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Firm</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {investors.map(investor => (
          <tr key={investor.id}>
            <td>{investor.name}</td>
            <td>{investor.firm}</td>
            <td>{investor.status}</td>
            <td>
              <button onClick={() => onEdit(investor)}>Edit</button>
              <button onClick={() => onDelete(investor.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
