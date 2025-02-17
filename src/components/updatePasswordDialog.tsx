import {
  Button,
  Checkbox,
  CircularProgress,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@heroui/react'
import { CatechistActionTypes } from '@/reducer/catechist/catechistActionTypes'
import { I18nProvider } from '@react-aria/i18n'
import { Controller, useForm } from 'react-hook-form'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { catechistReducer } from '@/reducer/catechist/catechistReducer'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext, useReducer, useState } from 'react'
import { z } from 'zod'
import { parseAbsoluteToLocal } from '@internationalized/date'
import type { catechist } from '@/Types'
import { AuthContext } from '@/contexts/AuthContext'
import { Eye, EyeSlash } from '@phosphor-icons/react'

const editCatechistFormSchema = z.object({
  password: z
    .string({ message: 'Insira um valor válido' })
    .min(1, 'Campo obrigatoŕio'),
})

interface EditCatechistFormModal {
  isOpen: boolean
  onClose: () => void
}

export function UpdateCatechistModal({
  isOpen,
  onClose,
}: EditCatechistFormModal) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editCatechistFormSchema),
  })
  const { user } = useContext(AuthContext)
  const [password, setPassword] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => setIsVisible(!isVisible)

  const [hasUserSubmittedForm, setHasUserSubmittedForm] =
    useState<boolean>(false)

  async function handleSubmitNewCatechistForm() {
    setHasUserSubmittedForm(true)
    try {
      console.log(password)
      await CatechistRepository.updatePassword(user!.id!, password).finally(
        () => {
          setHasUserSubmittedForm(false)
          setPassword('')
          onClose()
        }
      )
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setPassword('')
        reset()
        onClose()
      }}
      placement="center"
      scrollBehavior="outside"
      className="flex w-9/12 flex-col rounded-xl bg-bunker-900 py-2 md:w-5/12 lg:w-3/12 2xl:w-3/12"
    >
      <ModalContent>
        <ModalHeader className="flex justify-center text-xl">
          Mudar Senha
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={handleSubmit(handleSubmitNewCatechistForm)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="password"
              control={control}
              defaultValue={''}
              rules={{
                value: password,
                required: true,
                onChange: e => setPassword(e.target.value),
              }}
              render={({ field }) => (
                <Input
                  label="Nova senha"
                  {...field}
                  classNames={{ base: 'text-center' }}
                  type={isVisible ? 'text' : 'password'}
                  isInvalid={Boolean(errors.name)}
                  errorMessage={String(errors.name?.message)}
                  endContent={
                    <button
                      aria-label="toggle password visibility"
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {isVisible ? (
                        <EyeSlash size={24} className="text-bunker-900" />
                      ) : (
                        <Eye size={24} className="text-bunker-900" />
                      )}
                    </button>
                  }
                />
              )}
            />

            <Button
              variant="solid"
              aria-labelledby="cadastro de catequizando"
              aria-label="cadastro de catequizando"
              className="w-full p-2 font-medium shadow shadow-black"
              type="submit"
              size="lg"
            >
              {hasUserSubmittedForm ? <CircularProgress /> : 'Alterar senha'}
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
