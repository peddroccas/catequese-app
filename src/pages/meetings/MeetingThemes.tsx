import { toast } from '@/lib/toast'
import { PageHeader } from '@/components/PageHeader'
import { RowAction } from '@/components/IconButton'
import { SearchInput } from '@/components/SearchInput'
import { surfaceClassName } from '@/components/tableStyles'
import { getErrorMessage } from '@/services/api'
import {
  MeetingRepository,
  groupThemesByPhase,
} from '@/services/repositories/meetingRepository'
import { itineraries, itinerary, meetingTheme } from '@/Types'
import { matchesSearch } from '@/utils/search'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
} from '@nextui-org/react'
import { ArrowLeft, PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MeetingThemeModal } from './components/MeetingThemeModal'

const itineraryDescriptions: Record<itinerary, string> = {
  'Pré-Eucaristia': 'Turmas de Pré-Eucaristia',
  Eucaristia: 'Turmas de Eucaristia 1 e 2',
  Crisma: 'Turmas de Crisma 1 e 2',
  Adultos: 'Turmas de Catequese de Adultos',
}

// Coordenação: temas dos encontros de cada itinerário
export function MeetingThemes() {
  const navigate = useNavigate()
  const [themes, setThemes] = useState<meetingTheme[]>([])
  const [selectedItinerary, setSelectedItinerary] =
    useState<itinerary>('Eucaristia')
  const [search, setSearch] = useState<string>('')
  const [adding, setAdding] = useState<{ phase?: string }>()
  const [editing, setEditing] = useState<meetingTheme>()
  const [deleting, setDeleting] = useState<meetingTheme>()

  const loadThemes = useCallback(() => {
    MeetingRepository.getThemes()
      .then(setThemes)
      .catch((error) => toast.error(getErrorMessage(error)))
  }, [])

  useEffect(() => {
    loadThemes()
  }, [loadThemes])

  const itineraryThemes = themes.filter(
    (theme) => theme.itinerary === selectedItinerary,
  )
  const phases = groupThemesByPhase(itineraryThemes).map((group) => group.phase)
  const groups = groupThemesByPhase(
    itineraryThemes.filter(
      (theme) =>
        matchesSearch(theme.name, search) || matchesSearch(theme.phase, search),
    ),
  )

  async function handleDelete() {
    try {
      await MeetingRepository.deleteTheme(deleting!.id)
      setDeleting(undefined)
      loadThemes()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-grow flex-col gap-6">
      {(adding || editing) && (
        <MeetingThemeModal
          itinerary={selectedItinerary}
          phases={phases}
          data={editing}
          defaultPhase={adding?.phase}
          onClose={() => {
            setAdding(undefined)
            setEditing(undefined)
          }}
          onSaved={loadThemes}
        />
      )}
      <Modal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        placement="center"
      >
        <ModalContent>
          <ModalHeader>Deseja realmente excluir o tema?</ModalHeader>
          <ModalBody>
            <p>{deleting?.name}</p>
            <p className="text-sm text-bunker-500">
              Ele deixa de aparecer na hora de fazer a chamada, mas continua nas
              chamadas já registradas.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setDeleting(undefined)}>
              Cancelar
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Excluir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <PageHeader
        title="Temas dos encontros"
        description="Temas que os catequistas escolhem ao fazer a chamada, por itinerário"
      >
        <Button
          variant="bordered"
          startContent={<ArrowLeft size={18} />}
          onPress={() => navigate('/meetings')}
          className="border-1 border-bunker-200 bg-white font-medium text-bunker-700 shadow-sm"
        >
          Chamadas
        </Button>
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          onPress={() => setAdding({})}
        >
          Novo tema
        </Button>
      </PageHeader>

      <Tabs
        aria-label="Itinerários"
        variant="underlined"
        selectedKey={selectedItinerary}
        onSelectionChange={(key) => setSelectedItinerary(key as itinerary)}
        classNames={{
          tabList: 'gap-6 border-b border-bunker-200 p-0',
          cursor: 'bg-bunker-800',
          tab: 'h-11 px-0',
          tabContent:
            'font-medium text-bunker-500 group-data-[selected=true]:text-bunker-900',
          panel: 'hidden',
        }}
      >
        {itineraries.map((item) => (
          <Tab
            key={item}
            title={`${item} (${themes.filter((theme) => theme.itinerary === item).length})`}
          />
        ))}
      </Tabs>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Pesquisar tema ou fase"
        />
        <p className="text-sm text-bunker-500">
          {itineraryDescriptions[selectedItinerary]}
        </p>
      </div>

      {groups.length === 0 && (
        <p className="text-bunker-500">
          {itineraryThemes.length
            ? 'Nenhum tema encontrado.'
            : 'Nenhum tema cadastrado neste itinerário.'}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <section key={group.phase} className={`${surfaceClassName} p-4`}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-bunker-500">
                {group.phase}
              </h2>
              <Button
                size="sm"
                variant="light"
                color="primary"
                startContent={<Plus size={14} />}
                onPress={() => setAdding({ phase: group.phase })}
              >
                Tema nesta fase
              </Button>
            </div>
            <ol className="flex flex-col divide-y divide-bunker-100">
              {group.themes.map((theme) => (
                <li
                  key={theme.id}
                  className="flex items-start justify-between gap-3 py-2"
                >
                  <span className="text-sm text-bunker-800">{theme.name}</span>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <RowAction
                      label="Editar"
                      icon={<PencilSimple size={18} />}
                      onPress={() => setEditing(theme)}
                    />
                    <RowAction
                      label="Excluir"
                      variant="danger"
                      icon={<Trash size={18} />}
                      onPress={() => setDeleting(theme)}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
