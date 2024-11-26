import React from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Tab } from '@headlessui/react';
import { UserSettings } from './tabs/UserSettings';
import { GroupSettings } from './tabs/GroupSettings';
import { CourseSettings } from './tabs/CourseSettings';
import { LessonSettings } from './tabs/LessonSettings';
import { QuizSettings } from './tabs/QuizSettings';
import { NewsSettings } from './tabs/NewsSettings';
import { EbookSettings } from './tabs/EbookSettings';
import { clsx } from 'clsx';
import { 
  Users, 
  Group, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Newspaper,
  Book
} from 'lucide-react';

export const Settings = () => {
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: <Users className="w-5 h-5" />, component: UserSettings },
    { id: 'groups', label: 'Grupos', icon: <Group className="w-5 h-5" />, component: GroupSettings },
    { id: 'courses', label: 'Cursos', icon: <BookOpen className="w-5 h-5" />, component: CourseSettings },
    { id: 'lessons', label: 'Aulas', icon: <FileText className="w-5 h-5" />, component: LessonSettings },
    { id: 'quizzes', label: 'Avaliações', icon: <GraduationCap className="w-5 h-5" />, component: QuizSettings },
    { id: 'news', label: 'Notícias', icon: <Newspaper className="w-5 h-5" />, component: NewsSettings },
    { id: 'ebooks', label: 'E-books', icon: <Book className="w-5 h-5" />, component: EbookSettings }
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gerencie usuários, cursos, conteúdo e configurações da plataforma.
          </p>
        </div>

        <div className="mt-6">
          <Tab.Group>
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">
                Selecione uma aba
              </label>
              <select
                id="tabs"
                name="tabs"
                className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                defaultValue={tabs[0].id}
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <Tab.List className="flex -mb-px space-x-8">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.id}
                      className={({ selected }) =>
                        clsx(
                          'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm focus:outline-none',
                          selected
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={clsx(
                            'mr-3',
                            selected ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                          )}>
                            {tab.icon}
                          </span>
                          {tab.label}
                        </>
                      )}
                    </Tab>
                  ))}
                </Tab.List>
              </div>
            </div>

            <Tab.Panels className="mt-8">
              {tabs.map((tab) => (
                <Tab.Panel
                  key={tab.id}
                  className={clsx(
                    'space-y-6',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                >
                  <tab.component />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </MainLayout>
  );
};