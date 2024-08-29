import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { payment } from '../../../Types'

interface InstallmentProps {
  paymentData: payment
}
export function Installment({ paymentData }: InstallmentProps) {
  return (
    <div className="flex w-auto flex-col">
      <Table aria-label="this remove devtools warn">
        <TableHeader>
          <TableColumn>PARCELA</TableColumn>
          <TableColumn>VALOR</TableColumn>
          <TableColumn>DATA DE PAGAMENTO</TableColumn>
        </TableHeader>
        <TableBody>
          {paymentData.installments.map((installment, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {installment.value.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </TableCell>
              <TableCell>
                {new Date(String(installment.payedAt)).toLocaleString('pt-BR', {
                  day: '2-digit', // Dia do mês com dois dígitos
                  month: 'short', // Nome do mês abreviado
                  year: 'numeric', // Ano completo
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
