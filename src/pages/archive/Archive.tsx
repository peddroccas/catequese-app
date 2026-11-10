import { toast } from '@/lib/toast'
import { PageHeader } from '@/components/PageHeader'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { getErrorMessage } from '@/services/api'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { catechist, catechizing, classroom } from '@/Types'
import { Chip, Tab, Tabs } from '@nextui-org/react'
import { useCallback, useContext, useEffect, useState } from 'react'
import { ArchivedCatechists } from './components/ArchivedCatechists'
import { ArchivedCatechizings } from './components/ArchivedCatechizings'
import { ArchivedClassrooms } from './components/ArchivedClassrooms'

export interface archive {
  classrooms: classroom[]
  catechizings: catechizing[]
  catechists: catechist[]
}

export function Archive() {
  const { throwClassroomUpdate, throwCatechistUpdate, throwCatechizingUpdate } =
    useContext(ClassroomContext)
  const [archive, setArchive] = useState<archive>({
    classrooms: [],
    catechizings: [],
    catechists: [],
  })

  const loadArchive = useCallback(async () => {
    try {
      const [classrooms, catechizings, catechists] = await Promise.all([
        ClassroomRepository.getArchivedClassrooms(),
        CatechizingRepository.getArchivedCatechizings(),
        CatechistRepository.getArchivedCatechists(),
      ])
      setArchive({ classrooms, catechizings, catechists })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }, [])

  useEffect(() => {
    loadArchive()
  }, [loadArchive])

  // Depois de restaurar ou excluir, atualiza o arquivo e as listas ativas
  async function handleChange() {
    await loadArchive()
    throwClassroomUpdate()
    throwCatechistUpdate()
    throwCatechizingUpdate()
  }

  const tabTitle = (label: string, count: number) => (
    <div className="flex items-center gap-2">
      <span>{label}</span>
      <Chip
        size="sm"
        variant="flat"
        classNames={{
          base: 'h-5 bg-bunker-100',
          content: 'px-1 text-[11px] font-semibold text-bunker-600',
        }}
      >
        {count}
      </Chip>
    </div>
  )

  return (
    <div className="flex flex-grow flex-col gap-6">
      <PageHeader
        title="Arquivo"
        description="Turmas, catequizandos e catequistas arquivados. Consulte, restaure ou exclua de vez."
      />
      <Tabs
        aria-label="Arquivo"
        variant="underlined"
        classNames={{
          tabList: 'gap-6 border-b border-bunker-200 p-0',
          cursor: 'bg-bunker-800',
          tab: 'h-11 px-0',
          tabContent:
            'font-medium text-bunker-500 group-data-[selected=true]:text-bunker-900',
          panel: 'px-0 pt-5',
        }}
      >
        <Tab
          key="classrooms"
          title={tabTitle('Turmas', archive.classrooms.length)}
        >
          <ArchivedClassrooms
            classrooms={archive.classrooms}
            onChange={handleChange}
          />
        </Tab>
        <Tab
          key="catechizings"
          title={tabTitle('Catequizandos', archive.catechizings.length)}
        >
          <ArchivedCatechizings
            catechizings={archive.catechizings}
            archivedClassrooms={archive.classrooms}
            onChange={handleChange}
          />
        </Tab>
        <Tab
          key="catechists"
          title={tabTitle('Catequistas', archive.catechists.length)}
        >
          <ArchivedCatechists
            catechists={archive.catechists}
            onChange={handleChange}
          />
        </Tab>
      </Tabs>
    </div>
  )
}
