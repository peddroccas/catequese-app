import { getErrorMessage } from '@/services/api'
import { FinanceRepository } from '@/services/repositories/financeRepository'
import { expense } from '@/Types'
import { centsToInput, parseCurrencyToCents } from '@/utils/currency'
import { today } from '@/utils/date'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { DateInput, MoneyInput, PaymentMethodSelect } from './fields'

const expenseFormSchema = z.object({
  description: z.string().trim().min(1, 'Informe com o que foi gasto'),
  amount: z
    .string()
    .refine((value) => parseCurrencyToCents(value) !== null, 'Valor inválido'),
  date: z.string().min(1, 'Campo obrigatório'),
  paymentMethod: z.enum(['PIX', 'CASH', 'CARD'], {
    message: 'Escolha a forma de pagamento',
  }),
})

type ExpenseFormData = z.infer<typeof expenseFormSchema>

interface ExpenseModalProps {
  data?: expense
  onClose: () => void
  onSaved: () => void
}

// Cadastro e edição de saída do caixa
export function ExpenseModal({ data, onClose, onSaved }: ExpenseModalProps) {
  const [submitError, setSubmitError] = useState<string>('')
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: data?.description ?? '',
      amount: data ? centsToInput(data.amountCents) : '',
      date: data?.date ?? today(),
      paymentMethod: data?.paymentMethod,
    },
  })

  async function handleSubmitForm(form: ExpenseFormData) {
    setSubmitError('')
    const expense: expense = {
      id: data?.id,
      description: form.description,
      amountCents: parseCurrencyToCents(form.amount)!,
      date: form.date,
      paymentMethod: form.paymentMethod,
    }
    try {
      if (data?.id) {
        await FinanceRepository.updateExpense(expense)
      } else {
        await FinanceRepository.createExpense(expense)
      }
      onSaved()
      onClose()
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      placement="top"
      scrollBehavior="outside"
      className="py-2"
    >
      <ModalContent>
        <ModalHeader className="text-xl font-semibold text-bunker-900">
          {data ? 'Editar saída' : 'Nova saída'}
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={handleSubmit(handleSubmitForm)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  label="Destinação"
                  description="Com o que foi gasto"
                  {...field}
                  isInvalid={Boolean(errors.description)}
                  errorMessage={errors.description?.message}
                />
              )}
            />
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <MoneyInput
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.amount?.message}
                />
              )}
            />
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DateInput
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.date?.message}
                />
              )}
            />
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <PaymentMethodSelect
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.paymentMethod?.message}
                />
              )}
            />

            {submitError && (
              <p className="text-sm text-danger">{submitError}</p>
            )}

            <Button
              type="submit"
              size="lg"
              color="primary"
              className="w-full font-medium"
              isLoading={isSubmitting}
            >
              Salvar
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
