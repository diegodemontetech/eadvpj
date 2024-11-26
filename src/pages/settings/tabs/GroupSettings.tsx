import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Group } from '../../../types';
import { Plus, Trash, Save, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { clsx } from 'clsx';

const groupSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string(),
  permissions: z.object({
    courses: z.array(z.string()),
    features: z.array(z.enum(['certificates', 'ranking', 'news'])),
  }),
});

type GroupFormData = z.infer<typeof groupSchema>;

interface CourseModule {
  id: string;
  title: string;
  lessons: { id: string; title: string }[];
}

interface Course {
  id: string;
  title: string;
  modules: CourseModule[];
}

export const GroupSettings = () => {
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = React.useState<Group | null>(null);
  const [expandedCourses, setExpandedCourses] = React.useState<string[]>([]);
  const [expandedModules, setExpandedModules] = React.useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = React.useState<{
    courses: { [key: string]: boolean };
    modules: { [key: string]: boolean };
    lessons: { [key: string]: boolean };
  }>({
    courses: {},
    modules: {},
    lessons: {},
  });

  // Mock courses data - replace with API call
  const courses: Course[] = [
    {
      id: '1',
      title: 'Gestão de Pastagens',
      modules: [
        {
          id: '1-1',
          title: 'Introdução',
          lessons: [
            { id: '1-1-1', title: 'Conceitos Básicos' },
            { id: '1-1-2', title: 'Tipos de Pastagens' },
          ],
        },
        {
          id: '1-2',
          title: 'Manejo Rotacional',
          lessons: [
            { id: '1-2-1', title: 'Princípios do Pastejo' },
            { id: '1-2-2', title: 'Avaliação Final' },
          ],
        },
      ],
    },
    {
      id: '2',
      title: 'Nutrição Animal',
      modules: [
        {
          id: '2-1',
          title: 'Fundamentos',
          lessons: [
            { id: '2-1-1', title: 'Nutrientes Essenciais' },
            { id: '2-1-2', title: 'Metabolismo' },
          ],
        },
      ],
    },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
  });

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const togglePermission = (type: 'courses' | 'modules' | 'lessons', id: string) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: !prev[type][id],
      },
    }));

    // If selecting a course, select all its modules and lessons
    if (type === 'courses' && !selectedPermissions.courses[id]) {
      const course = courses.find(c => c.id === id);
      if (course) {
        course.modules.forEach(module => {
          setSelectedPermissions(prev => ({
            ...prev,
            modules: {
              ...prev.modules,
              [module.id]: true,
            },
            lessons: {
              ...prev.lessons,
              ...module.lessons.reduce((acc, lesson) => ({
                ...acc,
                [lesson.id]: true,
              }), {}),
            },
          }));
        });
      }
    }

    // If deselecting a course, deselect all its modules and lessons
    if (type === 'courses' && selectedPermissions.courses[id]) {
      const course = courses.find(c => c.id === id);
      if (course) {
        course.modules.forEach(module => {
          setSelectedPermissions(prev => ({
            ...prev,
            modules: {
              ...prev.modules,
              [module.id]: false,
            },
            lessons: {
              ...prev.lessons,
              ...module.lessons.reduce((acc, lesson) => ({
                ...acc,
                [lesson.id]: false,
              }), {}),
            },
          }));
        });
      }
    }
  };

  const onSubmit = async (data: GroupFormData) => {
    try {
      const groupData = {
        ...data,
        permissions: {
          ...data.permissions,
          courseAccess: selectedPermissions,
        },
      };

      if (selectedGroup) {
        setGroups(groups.map(g => 
          g.id === selectedGroup.id ? { ...g, ...groupData } : g
        ));
      } else {
        setGroups([...groups, { 
          id: Date.now().toString(),
          ...groupData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }]);
      }
      reset();
      setSelectedGroup(null);
      setSelectedPermissions({ courses: {}, modules: {}, lessons: {} });
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const deleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(null);
      reset();
      setSelectedPermissions({ courses: {}, modules: {}, lessons: {} });
    }
  };

  return (
    <div className="space-y-6">
      {/* Group List */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              Grupos de Usuários
            </h2>
            <button
              onClick={() => {
                setSelectedGroup(null);
                reset();
                setSelectedPermissions({ courses: {}, modules: {}, lessons: {} });
              }}
              className="btn flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Grupo
            </button>
          </div>

          <div className="space-y-4">
            {groups.map(group => (
              <div
                key={group.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500">{group.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      reset(group);
                      setSelectedPermissions(group.permissions?.courseAccess || {
                        courses: {},
                        modules: {},
                        lessons: {},
                      });
                    }}
                    className="btn-secondary"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteGroup(group.id)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Group Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            {selectedGroup ? 'Editar Grupo' : 'Novo Grupo'}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome do Grupo
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Course Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Permissões de Acesso aos Cursos
                </label>
                <div className="border rounded-lg divide-y">
                  {courses.map(course => (
                    <div key={course.id} className="bg-white">
                      <button
                        type="button"
                        onClick={() => toggleCourse(course.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.courses[course.id] || false}
                            onChange={() => togglePermission('courses', course.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                            onClick={e => e.stopPropagation()}
                          />
                          <span className="font-medium text-gray-900">
                            {course.title}
                          </span>
                        </div>
                        {expandedCourses.includes(course.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {expandedCourses.includes(course.id) && (
                        <div className="pl-8 pr-4 pb-4 space-y-3">
                          {course.modules.map(module => (
                            <div key={module.id} className="bg-gray-50 rounded-lg">
                              <button
                                type="button"
                                onClick={() => toggleModule(module.id)}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100"
                              >
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.modules[module.id] || false}
                                    onChange={() => togglePermission('modules', module.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                                    onClick={e => e.stopPropagation()}
                                  />
                                  <span className="text-sm font-medium text-gray-700">
                                    {module.title}
                                  </span>
                                </div>
                                {expandedModules.includes(module.id) ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                              </button>

                              {expandedModules.includes(module.id) && (
                                <div className="pl-8 pr-4 pb-3 pt-1 space-y-2">
                                  {module.lessons.map(lesson => (
                                    <div
                                      key={lesson.id}
                                      className="flex items-center p-2 rounded hover:bg-gray-100"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedPermissions.lessons[lesson.id] || false}
                                        onChange={() => togglePermission('lessons', lesson.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                                      />
                                      <span className="text-sm text-gray-600">
                                        {lesson.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissões de Recursos
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('permissions.features')}
                      value="certificates"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Certificados
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('permissions.features')}
                      value="ranking"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Ranking
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('permissions.features')}
                      value="news"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Notícias
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn flex items-center gap-2">
                <Save className="w-4 h-4" />
                {selectedGroup ? 'Atualizar Grupo' : 'Criar Grupo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};