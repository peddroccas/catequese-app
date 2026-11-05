import { ClassroomContext } from '@/contexts/ClassroomContext'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/services/api'
import { FinanceRepository } from '@/services/repositories/financeRepository'
import { entry, entrySource, entrySourceLabels, entrySources } from '@/Types'
import {
  centsToInput,
  formatCurrency,
  parseCurrencyToCents,
} from '@/utils/currency'
import { today } from '@/utils/date'
import {
  moneyAmount,
  notFutureDate,
  optionalPersonName,
  optionalText,
} from '@/utils/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { DateInput, MoneyInput, PaymentMethodSelect } from './fields'

const entryFormSchema = z
  .object({
    source: z.enum(['COLLABORATION', 'CARNE', 'DONATION', 'PARISH']),
    amount: moneyAmount(),
    date: notFutureDate(),
    paymentMethod: z.enum(['PIX', 'CASH', 'CARD'], {
      message: 'Escolha a forma de pagamento',
    }),
    payerName: optionalPersonName(),
    description: optionalText(200),
    catechizingId: z.string(),
  })
  .superRefine((form, context) => {
    if (form.source !== 'CARNE') {
      return
    }
    if (!form.catechizingId) {
      context.addIssue({
        code: 'custom',
        path: ['catechizingId'],
        message: 'Escolha o catequizando',
      })
    }
    if (!form.payerName) {
      context.addIssue({
        code: 'custom',
        path: ['payerName'],
        message: 'Informe quem pagou',
      })
    }
  })

type EntryFormData = z.infer<typeof entryFormSchema>

interface EntryModalProps {
  // Edição de uma entrada existente (só a coordenação)
  data?: entry
  // Recebimento do carnê: a origem fica travada em "Carnê" e o registro vai
  // pela rota que os catequistas também podem usar
  carneOnly?: boolean
  // Catequizando já escolhido (botão "Registrar pagamento" na linha)
  presetCatechizingId?: string
  // Quanto cada catequizando já pagou e o total do carnê (para avisar quanto
  // falta pagar)
  paidByCatechizing?: Record<string, number>
  carneTotalCents?: number
  onClose: () => void
  onSaved: () => void
}

// Cadastro e edição de entrada do caixa (colaboração, carnê, doação ou paróquia)
export function EntryModal({
  data,
  carneOnly = false,
  presetCatechizingId,
  paidByCatechizing,
  carneTotalCents,
  onClose,
  onSaved,
}: EntryModalProps) {
  const { user } = useAuth()
  const { catechizings } = useContext(ClassroomContext)
  const [submitError, setSubmitError] = useState<string>('')
  // Catequistas só registram carnê de catequizandos das suas turmas
  const availableCatechizings = catechizings.filter(
    (catechizing) =>
      user?.role === 'COORDINATOR' ||
      user?.classroomIds.includes(catechizing.classroomId ?? ''),
  )

  // Valor e "quem pagou" começam vazios: quem registra digita
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      source: data?.source ?? (carneOnly ? 'CARNE' : 'COLLABORATION'),
      amount: data ? centsToInput(data.amountCents) : '',
      date: data?.date ?? today(),
      paymentMethod: data?.paymentMethod,
      payerName: data?.payerName ?? '',
      description: data?.description ?? '',
      catechizingId: data?.catechizingId ?? presetCatechizingId ?? '',
    },
  })
  const source = watch('source')
  const catechizingId = watch('catechizingId')
  const isCarne = source === 'CARNE'

  // Quanto falta pagar do carnê do catequizando escolhido (na edição, o
  // pagamento que está sendo editado não conta como pago)
  const remainingCents =
    isCarne && catechizingId && paidByCatechizing && carneTotalCents
      ? Math.max(
          carneTotalCents -
            (paidByCatechizing[catechizingId] ?? 0) +
            (data?.catechizingId === catechizingId ? data.amountCents : 0),
          0,
        )
      : undefined

  function handleChooseCatechizing(id: string) {
    setValue('catechizingId', id, { shouldValidate: true })
  }

  async function handleSubmitForm(form: EntryFormData) {
    setSubmitError('')
    const common = {
      amountCents: parseCurrencyToCents(form.amount)!,
      date: form.date,
      paymentMethod: form.paymentMethod,
    }
    try {
      if (!data && carneOnly) {
        await FinanceRepository.createCarnePayment({
          ...common,
          catechizingId: form.catechizingId,
          payerName: form.payerName,
        })
      } else {
        const entry: entry = {
          ...common,
          id: data?.id,
          source: form.source,
          payerName: form.payerName || null,
          description: form.description || null,
          catechizingId: form.source === 'CARNE' ? form.catechizingId : null,
        }
        if (data?.id) {
          await FinanceRepository.updateEntry(entry)
        } else {
          await FinanceRepository.createEntry(entry)
        }
      }
      onSaved()
      onClose()
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    }
  }

  const title = carneOnly
    ? data
      ? 'Editar pagamento do carnê'
      : 'Registrar pagamento do carnê'
    : data
      ? 'Editar entrada'
      : 'Nova entrada'

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
          {title}
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={handleSubmit(handleSubmitForm)}
            className="flex flex-col gap-4"
          >
            {!carneOnly && (
              <Controller
                name="source"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Origem"
                    disallowEmptySelection
                    selectedKeys={[field.value]}
                    onChange={(event) =>
                      field.onChange(event.target.value as entrySource)
                    }
                    classNames={{
                      listbox: 'text-bunker-800',
                      selectorIcon: 'text-bunker-500',
                    }}
                  >
                    {entrySources.map((item) => (
                      <SelectItem key={item}>
                        {entrySourceLabels[item]}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            )}

            {isCarne && (
              <Controller
                name="catechizingId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    label="Catequizando"
                    selectedKey={field.value || null}
                    onSelectionChange={(key) =>
                      key && handleChooseCatechizing(String(key))
                    }
                    defaultItems={availableCatechizings}
                    isInvalid={Boolean(errors.catechizingId)}
                    errorMessage={errors.catechizingId?.message}
                    description={
                      remainingCents === undefined
                        ? undefined
                        : remainingCents > 0
                          ? `Falta pagar ${formatCurrency(remainingCents)} do carnê`
                          : 'Carnê quitado'
                    }
                  >
                    {(catechizing) => (
                      <AutocompleteItem key={catechizing.id!}>
                        {catechizing.name}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                )}
              />
            )}

            <Controller
              name="payerName"
              control={control}
              render={({ field }) => (
                <Input
                  label={isCarne ? 'Quem pagou' : 'De quem (opcional)'}
                  description={
                    source === 'COLLABORATION'
                      ? 'Catequista que colaborou'
                      : source === 'DONATION'
                        ? 'Quem doou'
                        : undefined
                  }
                  {...field}
                  isInvalid={Boolean(errors.payerName)}
                  errorMessage={errors.payerName?.message}
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
            {!carneOnly && (
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input label="Observação (opcional)" {...field} />
                )}
              />
            )}

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
