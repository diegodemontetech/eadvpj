import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Save, Plus, Trash } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const lessonSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string(),
  videoUrl: z.string().url('URL inválida'),
  duration: z.number().min(1, 'Duração deve ser maior que 0'),
  courseId: z.string(),
  moduleId: z.string(),
  requiredForCompletion: z.boolean(),
});

type LessonFormData = z.infer<typeof lessonSchema>;

export const LessonSettings = () => {
  const [attachments, setAttachments] = React.useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
  });

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    setAttachments(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
    },
  });

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: LessonFormData) => {
    try {
      const formData = new FormData();
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
      formData.append('data', JSON.stringify(data));
      
      // Here you would typically make an API call to save the lesson
      console.log('Form data:', formData);
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Adicionar Nova Aula
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Título da Aula
              </label>
              <input
                type="text"
                {...register('title')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Curso
              </label>
              <select
                {...register('courseId')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione um curso</option>
                <option value="1">Gestão de Pastagens</option>
                <option value="2">Nutrição Animal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Módulo
              </label>
              <select
                {...register('moduleId')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione um módulo</option>
                <option value="1">Módulo 1</option>
                <option value="2">Módulo 2</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                URL do Vídeo
              </label>
              <input
                type="url"
                {...register('videoUrl')}
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.videoUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.videoUrl.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duração (minutos)
              </label>
              <input
                type="number"
                {...register('duration', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('requiredForCompletion')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Obrigatória para conclusão do módulo
                </span>
              </label>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material de Apoio
            </label>
            <div
              {...getRootProps()}
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <input {...getInputProps()} />
                  <p className="pl-1">
                    {isDragActive
                      ? 'Solte os arquivos aqui'
                      : 'Arraste arquivos ou clique para selecionar'}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOC até 10MB
                </p>
              </div>
            </div>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Upload className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{file.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn flex items-center gap-2">
              <Save className="w-4 h-4" />
              Salvar Aula
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};