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
    <div className="flex w-fit flex-col">
      <Table>
        <TableHeader>
          <TableColumn>PARCELA</TableColumn>
          <TableColumn>VALOR</TableColumn>
          <TableColumn>DATA DE PAGAMENTO</TableColumn>
        </TableHeader>
        <TableBody>
          {paymentData.installment.map((installment, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {installment.value.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </TableCell>
              <TableCell>{installment.payedAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
